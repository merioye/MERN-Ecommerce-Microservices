/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable } from '@nestjs/common';
import {
  Admin,
  CompressionTypes,
  Consumer,
  ConsumerRunConfig,
  Kafka,
  KafkaConfig,
  Message,
  Producer,
  ProducerRecord,
  RecordMetadata,
  SASLOptions,
} from 'kafkajs';

import { ILogger } from '../../logger';
import { DeadLetterErrorReason, MessageTopic, SubscribeFrom } from '../enums';
import {
  EventMessage,
  EventMessageMetadata,
  KafkaBrokerConfig,
  MessageSubscription,
  SubscribeOptions,
  Topic,
} from '../types';
import { BaseMessageBroker } from './base.broker';

/**
 * Implementation of a message broker using Kafka.
 *
 * Handles publishing and subscribing to Kafka topics with support for:
 * - Reliable message delivery with retries
 * - Dead letter queues
 * - Idempotent producers
 * - Transaction support
 * - Automatic reconnection
 * - Health monitoring
 *
 * @class KafkaMessageBroker
 * @extends {BaseMessageBroker}
 */
@Injectable()
export class KafkaMessageBroker extends BaseMessageBroker {
  private readonly _kafka: Kafka;
  private _producer: Producer;
  private _admin: Admin;
  private _consumer: Consumer | undefined = undefined;
  private readonly _subscriptions: Map<string, MessageSubscription> = new Map();
  private _connectionPromise: Promise<void> | null = null;
  private _producerReady: boolean = false;
  private _adminReady: boolean = false;
  private readonly _topicExists: Set<string> = new Set();
  /**
   * Queue for storing messages that couldn't be immediately published
   * @private
   */
  private readonly _pendingMessages: Array<{
    record: ProducerRecord;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: unknown) => void;
    retries: number;
  }> = [];
  private _processingPendingMessages: boolean = false;

  /**
   * Creates a new KafkaMessageBroker instance.
   *
   * @param {KafkaBrokerConfig} config - Configuration options for the Kafka broker
   * @param {ILogger} logger - Logger instance for recording broker activity
   */
  public constructor(config: KafkaBrokerConfig, logger: ILogger) {
    super(config, logger);

    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.tls,
      sasl: config.sasl as SASLOptions,
      connectionTimeout: config.timeout || 30000,
      retry: {
        initialRetryTime: 300,
        retries: config.maxRetries || 10,
        factor: 1.5, // exponential factor
        maxRetryTime: 30000,
      },
    };

    this._logger.debug('Broker(Kafka): Initialized with config:', {
      ...kafkaConfig,
      tls: config.tls ? '(certificates omitted)' : undefined,
      sasl: config.sasl ? '(credentials omitted)' : undefined,
    });
    this._kafka = new Kafka(kafkaConfig);
    this._producer = this._kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true, // Enable idempotent producer for exactly-once semantics
      transactionalId: `${config.clientId}-txn`, // Enable transactions
    });
    this._admin = this._kafka.admin();
  }

  /**
   * Establishes connections to the Kafka broker.
   * Connects both producer and admin clients.
   *
   * @protected
   * @returns {Promise<void>} A promise that resolves when connections are established
   */
  protected async doConnect(): Promise<void> {
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    this._connectionPromise = (async (): Promise<void> => {
      try {
        this._logger.info('Broker(Kafka): Connecting to broker...');

        // Connect producer
        await this._producer.connect();
        this._producerReady = true;
        this._logger.info('Broker(Kafka): Producer connected successfully 🚀');

        // Connect admin
        await this._admin.connect();
        this._adminReady = true;
        this._logger.info('Broker(Kafka): Admin connected successfully 🚀');

        // Set up producer error handling and reconnection
        this._producer.on('producer.disconnect', async () => {
          this._logger.warn(
            'Broker(Kafka): Producer disconnected, attempting to reconnect'
          );
          this._producerReady = false;
          await this.reconnectProducer();
        });

        // Set up admin error handling and reconnection
        this._admin.on('admin.disconnect', async () => {
          this._logger.warn(
            'Broker(Kafka): Admin disconnected, attempting to reconnect'
          );
          this._adminReady = false;
          await this.reconnectAdmin();
        });

        // Process any pending messages
        if (this._pendingMessages.length > 0) {
          await this.processPendingMessages();
        }

        return;
      } catch (error) {
        this._connectionPromise = null;
        throw error;
      }
    })();

    return this._connectionPromise;
  }

  /**
   * Disconnects from the Kafka broker.
   * Closes producer, admin, and consumer connections.
   *
   * @protected
   * @returns {Promise<void>} A promise that resolves when all connections are closed
   */
  protected async doDisconnect(): Promise<void> {
    this._connectionPromise = null;
    this._topicExists.clear();

    const disconnectPromises = [];

    if (this._producerReady) {
      disconnectPromises.push(
        this._producer
          .disconnect()
          .catch((err) =>
            this._logger.error(
              'Broker(Kafka): Error disconnecting producer',
              err
            )
          )
      );
      this._producerReady = false;
    }

    if (this._adminReady) {
      disconnectPromises.push(
        this._admin
          .disconnect()
          .catch((err) =>
            this._logger.error('Broker(Kafka): Error disconnecting admin', err)
          )
      );
      this._adminReady = false;
    }

    if (this._consumer) {
      disconnectPromises.push(
        this._consumer
          .disconnect()
          .catch((err) =>
            this._logger.error(
              'Broker(Kafka): Error disconnecting consumer',
              err
            )
          )
      );
      this._consumer = undefined;
    }

    this._subscriptions.clear();

    await Promise.all(disconnectPromises);
  }

  /**
   * Publishes a single message to a Kafka topic.
   * Ensures the topic exists before publishing.
   *
   * @protected
   * @template T - Type of the message value
   * @param {EventMessage<T>} param0 - Message object containing topic, value and config
   * @param {MessageTopic} param0.topic - The topic to publish to
   * @param {T} param0.value - The message payload
   * @param {Object} [param0.config] - Additional configuration for the message
   * @returns {Promise<void>} A promise that resolves when the message is published
   */
  protected async doPublish<T>({
    topic,
    value,
    config,
  }: EventMessage<T>): Promise<void> {
    const topicStr = topic?.toString();
    const maxRetries = config?.retries ?? this._reconnectAttempts;

    // Create a record object to be sent
    const record: ProducerRecord = {
      topic: topicStr,
      compression: CompressionTypes.GZIP, // Use compression for efficiency
      messages: [
        {
          key: config?.key,
          value: JSON.stringify(value),
          headers: config?.headers,
          timestamp: config?.timestamp?.toString(),
          partition: config?.partition,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      void (async (): Promise<void> => {
        // Ensure topic exists
        try {
          await this.ensureTopicExists(topicStr);
        } catch (error) {
          return reject(
            new Error(
              `Broker(Kafka): Failed to ensure topic exists: ${(error as Error)?.message}`
            )
          );
        }

        // Try to send immediately if producer is ready
        if (this._producerReady) {
          try {
            await this.sendWithRetry(record, maxRetries);
            return resolve();
          } catch (error) {
            this._logger.error(
              `Broker(Kafka): Failed to produce message to topic ${topicStr} after ${maxRetries} attempts`,
              error
            );
            return reject(error);
          }
        } else {
          // Queue message for later processing
          this._logger.debug(
            `Broker(Kafka): Producer not ready, queuing message to topic ${topicStr}`
          );
          this._pendingMessages.push({
            record,
            resolve,
            reject,
            retries: maxRetries,
          });

          // Try to connect if not already connecting
          if (!this._connectionPromise) {
            this.doConnect().catch((err) => {
              this._logger.error(
                'Broker(Kafka): Failed to connect while processing pending message',
                err
              );
            });
          }
        }
      })();
    });
  }

  /**
   * Publishes multiple messages in a single transaction.
   * Groups messages by topic for efficiency.
   *
   * @protected
   * @template T - Type of the message values
   * @param {EventMessage<T>[]} messages - Array of messages to publish
   * @returns {Promise<void>} A promise that resolves when all messages are published
   */
  protected async doPublishBatch<T>(
    messages: EventMessage<T>[]
  ): Promise<void> {
    if (messages.length === 0) return;

    // Group messages by topic for efficiency
    const messagesByTopic = messages.reduce(
      (acc, message) => {
        const topicStr = message.topic.toString();
        if (!acc[topicStr]) {
          acc[topicStr] = [];
        }
        acc[topicStr].push({
          key: message.config?.key,
          value: JSON.stringify(message.value),
          headers: message.config?.headers,
          timestamp: message.config?.timestamp?.toString(),
          partition: message.config?.partition,
        });
        return acc;
      },
      {} as Record<string, Message[]>
    );

    const allTopics = Object.keys(messagesByTopic);

    // Ensure all topics exist before publishing
    for (const topic of allTopics) {
      await this.ensureTopicExists(topic);
    }

    // Use transaction for batch consistency
    const transaction = await this._producer.transaction();

    try {
      // Send messages for each topic
      const sendPromises = Object.entries(messagesByTopic).map(
        ([topic, msgs]) => {
          return transaction.send({
            topic,
            compression: CompressionTypes.GZIP,
            messages: msgs,
          });
        }
      );

      await Promise.all(sendPromises);
      await transaction.commit();

      this._logger.debug(
        `Broker(Kafka): Successfully produced batch of ${messages.length} messages to ${allTopics.length} topics`
      );
    } catch (error) {
      // Abort transaction on error
      await transaction.abort().catch((abortError) => {
        this._logger.error(
          'Broker(Kafka): Failed to abort transaction',
          abortError
        );
      });

      this._logger.error(
        `Broker(Kafka): Failed to produce batch of ${messages.length} messages`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribes to one or more Kafka topics.
   * Sets up message handlers and retry logic.
   *
   * @protected
   * @param {MessageSubscription[]} subscriptions - Array of topic subscriptions with handlers
   * @param {SubscribeOptions} options - Subscription configuration options
   * @returns {Promise<void>} A promise that resolves when subscriptions are established
   */
  protected async doSubscribe(
    subscriptions: MessageSubscription[],
    options: SubscribeOptions
  ): Promise<void> {
    if (!this._consumer) {
      this._consumer = this._kafka.consumer({
        groupId: options.groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: 1048576, // 1MB
        maxWaitTimeInMs: 500,
      });

      // Set up consumer error handling
      this._consumer.on('consumer.crash', async (event) => {
        this._logger.error(
          'Broker(Kafka): Consumer crashed, attempting to recover',
          event.payload
        );
        await this.recoverConsumer(options);
      });

      this._consumer.on('consumer.disconnect', async () => {
        this._logger.warn(
          'Broker(Kafka): Consumer disconnected, attempting to recover'
        );
        await this.recoverConsumer(options);
      });

      await this._consumer.connect();
    }

    // Configure dead letter topic if retry is enabled
    let deadLetterTopic: string | undefined;
    if (options.retry && options.retry.maxRetries > 0) {
      deadLetterTopic = `${options.groupId}-dead-letter`;
      await this.ensureTopicExists(deadLetterTopic);
    }

    // Subscribe to all topics
    for (const { topic, config } of subscriptions) {
      const topicStr = topic.toString();
      await this._consumer.subscribe({
        topic: topicStr,
        fromBeginning: config.subscribeFrom === SubscribeFrom.EARLIEST,
      });

      // Store subscription for possible recovery
      this._subscriptions.set(topicStr, {
        topic,
        handler: subscriptions.find((s) => s.topic === topic)!.handler,
        config,
      });
    }

    // Configure consumer run options
    const consumerRunConfig: ConsumerRunConfig = {
      autoCommit: false, // Disable auto-commit to enable manual acknowledgment
      eachMessage: async ({ message, topic, partition }) => {
        const subscription = this._subscriptions.get(topic);
        if (!subscription) {
          this._logger.warn(
            `Broker(Kafka): Received message for unsubscribed topic: ${topic}`
          );
          return;
        }

        let retryCount = 0;
        let parsedMessage: EventMessage;

        try {
          // Parse message
          const messageValue = message.value?.toString() || '';

          // Check if this is a retry message
          if (message.headers?.retryCount) {
            retryCount = parseInt(message.headers.retryCount.toString(), 10);
          }

          // Parse message value
          try {
            parsedMessage = {
              topic: topic as unknown as MessageTopic,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value: JSON.parse(messageValue),
              config: {
                key: message.key?.toString(),
                headers: message.headers as Record<string, string>,
                timestamp: parseInt(message.timestamp),
                partition: partition,
              },
              // Add metadata for manual commit
              metadata: {
                topic,
                partition,
                offset: message.offset,
              },
            };
          } catch (parseError) {
            this._logger.error(
              `Broker(Kafka): Failed to parse message value: ${messageValue}`,
              parseError
            );
            // Send to dead letter if parsing fails (can't retry)
            if (deadLetterTopic) {
              await this.sendToDeadLetterTopic(
                deadLetterTopic,
                message,
                topic,
                DeadLetterErrorReason.PARSE_ERROR,
                parseError as Error
              );
            }
            await this.doAcknowledgeMsg({
              topic,
              partition,
              offset: message.offset,
            });
            return;
          }

          // Process message with handler
          await subscription.handler(parsedMessage);

          // Acknowledge successful processing
          if (options?.autoCommit !== false) {
            await this.doAcknowledgeMsg({
              topic,
              partition,
              offset: message.offset,
            });
            if (retryCount > 0) {
              this._logger.info(
                `Broker(Kafka): Successfully processed message from topic ${topic} after ${retryCount} retries`
              );
            }
          } else {
            // Manual commit if autoCommit is false
            // Don't commit here - leave it to the subscriber to call acknowledgeMsg
          }
        } catch (error) {
          this._logger.error(
            `Broker(Kafka): Error processing message from topic ${topic} (retry ${retryCount})`,
            error
          );

          // Retry logic
          if (options?.retry && retryCount < options.retry.maxRetries) {
            try {
              // Prepare message for retry with incremented retry count
              const retryMessage: Message = {
                ...message,
                headers: {
                  ...message.headers,
                  retryCount: (retryCount + 1).toString(),
                  errorMessage:
                    (error as Error)?.message?.substring(0, 256) ||
                    'Unknown error',
                  lastRetryTimestamp: Date.now().toString(),
                },
              };

              // Wait for backoff period
              const backoffTime =
                options.retry.backoff * Math.pow(2, retryCount);
              await new Promise((resolve) => setTimeout(resolve, backoffTime));

              // Send message back to same topic for retry
              await this._producer.send({
                topic,
                messages: [retryMessage],
              });

              this._logger.info(
                `Broker(Kafka): Scheduled retry ${retryCount + 1}/${options.retry.maxRetries} for message in topic ${topic}`
              );
            } catch (retryError) {
              this._logger.error(
                `Broker(Kafka): Failed to schedule retry for message`,
                retryError
              );

              // Send to dead letter if retry scheduling fails
              if (deadLetterTopic) {
                await this.sendToDeadLetterTopic(
                  deadLetterTopic,
                  message,
                  topic,
                  DeadLetterErrorReason.RETRY_FAILED,
                  error as Error
                );
              }
              await this.doAcknowledgeMsg({
                topic,
                partition,
                offset: message.offset,
              });
            }
          } else {
            // Max retries exceeded, send to dead letter topic
            if (deadLetterTopic) {
              await this.sendToDeadLetterTopic(
                deadLetterTopic,
                message,
                topic,
                DeadLetterErrorReason.MAX_RETRIES_EXCEEDED,
                error as Error
              );
            }
            await this.doAcknowledgeMsg({
              topic,
              partition,
              offset: message.offset,
            });
          }
        }
      },
    };

    // Start consuming
    await this._consumer.run(consumerRunConfig);

    const topicsArray = Array.from(this._subscriptions.keys());
    this._logger.info(
      `Broker(Kafka): Successfully subscribed to topics: ${topicsArray.join(', ')}`
    );
  }

  /**
   * Manually acknowledges a message has been processed.
   * Used when autoCommit is disabled.
   *
   * @protected
   * @param {EventMessageMetadata} param0 - Metadata for the message to acknowledge
   * @param {string} param0.topic - Topic the message was received from
   * @param {number} param0.partition - Partition the message was received from
   * @param {string} param0.offset - Offset of the message
   * @returns {Promise<void>} A promise that resolves when the offset is committed
   */
  protected async doAcknowledgeMsg({
    topic,
    partition,
    offset,
  }: EventMessageMetadata): Promise<void> {
    if (!this._consumer) {
      throw new Error('Broker(Kafka): Consumer not initialized');
    }

    await this._consumer.commitOffsets([
      {
        topic,
        partition,
        offset: (parseInt(offset) + 1).toString(),
      },
    ]);
  }

  /**
   * Pauses consumption from specified topics.
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics to unsubscribe from
   * @returns {Promise<void>} A promise that resolves when unsubscribed
   */
  protected async doUnsubscribe(topics: MessageTopic[]): Promise<void> {
    if (this._consumer) {
      const topicsStr = topics.map((topic) => topic.toString());

      try {
        // Pause consumption from topics
        this._consumer.pause(topicsStr.map((topic) => ({ topic })));

        // Remove from subscription map
        topicsStr.forEach((topic) => this._subscriptions.delete(topic));

        this._logger.info(
          `Broker(Kafka): Paused consumption from topics: ${topicsStr.join(', ')}`
        );
      } catch (error) {
        this._logger.error(
          `Broker(Kafka): Failed to unsubscribe from topics: ${topicsStr.join(', ')}`,
          error
        );
        throw error;
      }
    }
    return Promise.resolve();
  }

  /**
   * Resumes consumption from previously paused topics.
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics to resume subscription to
   * @returns {Promise<void>} A promise that resolves when resubscribed
   */
  protected async doReSubscribe(topics: MessageTopic[]): Promise<void> {
    if (this._consumer) {
      const topicsStr = topics.map((topic) => topic.toString());

      try {
        // Resume consumption from topics
        this._consumer.resume(topicsStr.map((topic) => ({ topic })));

        this._logger.info(
          `Broker(Kafka): Resumed consumption from topics: ${topicsStr.join(', ')}`
        );
      } catch (error) {
        this._logger.error(
          `Broker(Kafka): Failed to resubscribe to topics: ${topicsStr.join(', ')}`,
          error
        );
        throw error;
      }
    }
    return Promise.resolve();
  }

  /**
   * Creates topics in Kafka if they don't already exist.
   *
   * @protected
   * @param {Topic[]} topics - Array of topics to create with their configurations
   * @returns {Promise<void>} A promise that resolves when topics are created
   */
  protected async doCreateTopics(topics: Topic[]): Promise<void> {
    if (!this._adminReady) {
      throw new Error('Broker(Kafka): Admin client not ready');
    }

    try {
      await this._admin.createTopics({
        topics: topics.map((topic) => ({
          topic: topic.topic?.toString(),
          numPartitions: topic.config?.partitions ?? 1,
          replicationFactor: topic.config?.replicationFactor ?? 1,
          configEntries: [
            ...(topic.config?.retentionsMs
              ? [
                  {
                    name: 'retention.ms',
                    value: topic.config?.retentionsMs?.toString(),
                  },
                ]
              : []),
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'min.insync.replicas', value: '2' },
          ],
        })),
        timeout: 30000, // 30 seconds
      });

      // Add to topic cache
      topics.forEach((topic) => this._topicExists.add(topic.topic.toString()));

      this._logger.info(
        `Broker(Kafka): Created topics: ${topics.map((t) => t.topic).join(', ')}`
      );
    } catch (error) {
      // Check if error is due to topic already existing
      if ((error as Error)?.message?.includes('already exists')) {
        this._logger.warn(
          `Broker(Kafka): Some topics already exist: ${(error as Error)?.message}`
        );

        // Add to topic cache anyway
        topics.forEach((topic) =>
          this._topicExists.add(topic.topic.toString())
        );
        return;
      }

      this._logger.error(`Broker(Kafka): Failed to create topics`, error);
      throw error;
    }
  }

  /**
   * Deletes topics from Kafka.
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics to delete
   * @returns {Promise<void>} A promise that resolves when topics are deleted
   */
  protected async doDeleteTopics(topics: MessageTopic[]): Promise<void> {
    if (!this._adminReady) {
      throw new Error('Broker(Kafka): Admin client not ready');
    }

    const topicsStr = topics.map((topic) => topic.toString());

    try {
      await this._admin.deleteTopics({
        topics: topicsStr,
        timeout: 30000, // 30 seconds
      });

      // Remove from topic cache
      topicsStr.forEach((topic) => this._topicExists.delete(topic));

      this._logger.info(
        `Broker(Kafka): Deleted topics: ${topicsStr.join(', ')}`
      );
    } catch (error) {
      this._logger.error(
        `Broker(Kafka): Failed to delete topics: ${topicsStr.join(', ')}`,
        error
      );
      throw error;
    }
  }

  /**
   * Performs a health check on the broker connections.
   *
   * @protected
   * @returns {Promise<boolean>} A promise that resolves to true if broker is healthy
   */
  protected async doHealthCheck(): Promise<boolean> {
    try {
      if (!this._adminReady) {
        return false;
      }

      // List topics as a lightweight check
      await this._admin.listTopics();

      // Additional checks
      const producerHealthy = this._producerReady;
      const consumerHealthy =
        !this._consumer || (await this.consumerHealthCheck());

      const isHealthy = producerHealthy && consumerHealthy;
      this._logger.debug(
        `Broker(Kafka) health check: ${isHealthy ? 'healthy' : 'unhealthy'} (producer: ${producerHealthy}, consumer: ${consumerHealthy})`
      );

      return isHealthy;
    } catch (error) {
      this._logger.error('Broker(Kafka): Health check failed', error);
      return false;
    }
  }

  /**
   * Reconnects the producer after a disconnection.
   * Implements exponential backoff for retry attempts.
   *
   * @private
   * @param {number} [retryCount=0] - Current retry attempt number
   * @returns {Promise<void>} A promise that resolves when reconnected
   */
  private async reconnectProducer(retryCount = 0): Promise<void> {
    if (this._producerReady) return;

    const maxRetries = this._reconnectAttempts;
    const retryInterval = this._reconnectInterval;

    try {
      // Create a new producer instance if needed
      if (retryCount === 0) {
        try {
          await this._producer.disconnect();
        } catch (err) {
          this._logger.debug(
            'Broker(Kafka): Error while disconnecting old producer',
            err
          );
        }

        this._producer = this._kafka.producer({
          allowAutoTopicCreation: false,
          idempotent: true,
          transactionalId: `${(this._config as KafkaBrokerConfig).clientId}-txn`,
        });
      }

      await this._producer.connect();
      this._producerReady = true;
      this._logger.info('Broker(Kafka): Producer reconnected successfully');

      // Reattach event listeners
      this._producer.on('producer.disconnect', async () => {
        this._logger.warn(
          'Broker(Kafka): Producer disconnected, attempting to reconnect'
        );
        this._producerReady = false;
        await this.reconnectProducer();
      });

      // Process any pending messages
      if (this._pendingMessages.length > 0) {
        await this.processPendingMessages();
      }
    } catch (error) {
      this._logger.error(
        `Broker(Kafka): Failed to reconnect producer (attempt ${retryCount + 1}/${maxRetries})`,
        error
      );

      if (retryCount < maxRetries - 1) {
        this._logger.info(
          `Broker(Kafka): Retrying producer connection in ${retryInterval}ms`
        );
        setTimeout(() => this.reconnectProducer(retryCount + 1), retryInterval);
      } else {
        this._logger.error(
          `Broker(Kafka): Failed to reconnect producer after ${maxRetries} attempts`
        );
      }
    }
  }

  /**
   * Reconnects the admin client after a disconnection.
   * Implements exponential backoff for retry attempts.
   *
   * @private
   * @param {number} [retryCount=0] - Current retry attempt number
   * @returns {Promise<void>} A promise that resolves when reconnected
   */
  private async reconnectAdmin(retryCount = 0): Promise<void> {
    if (this._adminReady) return;

    const maxRetries = this._reconnectAttempts;
    const retryInterval = this._reconnectInterval;

    try {
      // Create a new admin instance if needed
      if (retryCount === 0) {
        try {
          await this._admin.disconnect();
        } catch (err) {
          this._logger.debug(
            'Broker(Kafka): Error while disconnecting old admin',
            err
          );
        }

        this._admin = this._kafka.admin();
      }

      await this._admin.connect();
      this._adminReady = true;
      this._logger.info('Broker(Kafka): Admin reconnected successfully');

      // Reattach event listeners
      this._admin.on('admin.disconnect', async () => {
        this._logger.warn(
          'Broker(Kafka): Admin disconnected, attempting to reconnect'
        );
        this._adminReady = false;
        await this.reconnectAdmin();
      });
    } catch (error) {
      this._logger.error(
        `Broker(Kafka): Failed to reconnect admin (attempt ${retryCount + 1}/${maxRetries})`,
        error
      );

      if (retryCount < maxRetries - 1) {
        this._logger.info(
          `Broker(Kafka): Retrying admin connection in ${retryInterval}ms`
        );
        setTimeout(() => this.reconnectAdmin(retryCount + 1), retryInterval);
      } else {
        this._logger.error(
          `Broker(Kafka): Failed to reconnect admin after ${maxRetries} attempts`
        );
      }
    }
  }

  /**
   * Sends a message with automatic retries on failure.
   * Implements exponential backoff between retry attempts.
   *
   * @private
   * @param {ProducerRecord} record - Record to send
   * @param {number} retriesLeft - Number of retries remaining
   * @param {number} [attempt=1] - Current attempt number
   * @returns {Promise<RecordMetadata[]>} A promise that resolves with metadata about the sent record
   */
  private async sendWithRetry(
    record: ProducerRecord,
    retriesLeft: number,
    attempt = 1
  ): Promise<RecordMetadata[]> {
    try {
      const metadata = await this._producer.send(record);
      if (attempt > 1) {
        this._logger.info(
          `Broker(Kafka): Successfully produced message to topic ${record.topic} after ${attempt} attempts`
        );
      } else {
        this._logger.debug(
          `Broker(Kafka): Produced message to topic ${record.topic}`
        );
      }
      return metadata;
    } catch (error) {
      // Check if we should retry
      if (retriesLeft > 0) {
        const delay = Math.min(100 * Math.pow(2, attempt), 5000); // Exponential backoff with 5s max
        this._logger.warn(
          `Broker(Kafka): Failed to produce message to topic ${record.topic} (attempt ${attempt}), retrying in ${delay}ms`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.sendWithRetry(record, retriesLeft - 1, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Processes pending messages in the queue if conditions are met.
   * Messages are processed sequentially while ensuring the producer is ready.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when processing is complete
   */
  private async processPendingMessages(): Promise<void> {
    if (
      this._processingPendingMessages ||
      this._pendingMessages.length === 0 ||
      !this._producerReady
    ) {
      return;
    }

    this._processingPendingMessages = true;
    this._logger.info(
      `Broker(Kafka): Processing ${this._pendingMessages.length} pending messages`
    );

    while (this._pendingMessages.length > 0 && this._producerReady) {
      const { record, resolve, reject, retries } =
        this._pendingMessages.shift()!;

      try {
        await this.ensureTopicExists(record.topic);
        await this.sendWithRetry(record, retries);
        resolve();
      } catch (error) {
        this._logger.error(
          `Broker(Kafka): Failed to process pending message to topic ${record.topic}`,
          error
        );
        reject(error);
      }
    }

    this._processingPendingMessages = false;
  }

  /**
   * Ensures a Kafka topic exists before sending messages to it.
   * Creates the topic if it doesn't exist.
   *
   * @private
   * @param {string} topic - The name of the topic to verify or create
   * @returns {Promise<void>} A promise that resolves when the topic exists
   */
  private async ensureTopicExists(topic: string): Promise<void> {
    if (this._topicExists.has(topic)) {
      return;
    }

    if (!this._adminReady) {
      throw new Error('Broker(Kafka): Admin client not ready');
    }

    try {
      const existingTopics = await this._admin.listTopics();

      if (!existingTopics.includes(topic)) {
        this._logger.info(
          `Broker(Kafka): Topic ${topic} does not exist, creating it`
        );
        await this.doCreateTopics([
          { topic: topic as unknown as MessageTopic },
        ]);
      }

      this._topicExists.add(topic);
    } catch (error) {
      this._logger.error(
        `Broker(Kafka): Failed to ensure topic exists: ${topic}`,
        error
      );
      throw error;
    }
  }

  /**
   * Sends a failed message to a dead letter topic with additional error metadata.
   *
   * @private
   * @param {string} deadLetterTopic - The topic to send the failed message to
   * @param {Message} originalMessage - The message that failed processing
   * @param {string} originalTopic - The topic the message was originally sent to
   * @param {DeadLetterErrorReason} reason - The categorized reason for the failure
   * @param {Error} error - The error that caused the failure
   * @returns {Promise<void>} A promise that resolves when the message is sent to the dead letter topic
   */
  private async sendToDeadLetterTopic(
    deadLetterTopic: string,
    originalMessage: Message,
    originalTopic: string,
    reason: DeadLetterErrorReason,
    error: Error
  ): Promise<void> {
    try {
      await this._producer.send({
        topic: deadLetterTopic,
        messages: [
          {
            ...originalMessage,
            headers: {
              ...originalMessage.headers,
              originalTopic,
              failureReason: reason,
              errorMessage: error.message?.substring(0, 256) || 'Unknown error',
              errorStack: error.stack?.substring(0, 1024) || 'No stack trace',
              failureTimestamp: Date.now().toString(),
            },
          },
        ],
      });

      this._logger.info(
        `Broker(Kafka): Sent failed message from topic ${originalTopic} to dead letter topic ${deadLetterTopic}`
      );
    } catch (dlqError) {
      this._logger.error(
        `Broker(Kafka): Failed to send message to dead letter topic ${deadLetterTopic}`,
        dlqError
      );
    }
  }

  /**
   * Attempts to recover a consumer after a crash or disconnect.
   * Creates a new consumer instance and resubscribes to all previously subscribed topics.
   *
   * @private
   * @param {SubscribeOptions} options - The subscription options used for the original consumer
   * @returns {Promise<void>} A promise that resolves when recovery is complete or rejects if recovery fails
   */
  private async recoverConsumer(options: SubscribeOptions): Promise<void> {
    this._logger.info('Broker(Kafka): Attempting to recover consumer');

    try {
      // Disconnect old consumer if exists
      if (this._consumer) {
        try {
          await this._consumer.disconnect();
        } catch (err) {
          this._logger.debug(
            'Broker(Kafka): Error while disconnecting old consumer',
            err
          );
        }
      }

      // Create new consumer
      this._consumer = this._kafka.consumer({
        groupId: options.groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });

      // Set up error handling
      this._consumer.on('consumer.crash', async (event) => {
        this._logger.error(
          'Broker(Kafka): Consumer crashed, attempting to recover',
          event.payload
        );
        await this.recoverConsumer(options);
      });

      this._consumer.on('consumer.disconnect', async () => {
        this._logger.warn(
          'Broker(Kafka): Consumer disconnected, attempting to recover'
        );
        await this.recoverConsumer(options);
      });

      // Connect and resubscribe to all topics
      await this._consumer.connect();

      const subscriptions = Array.from(this._subscriptions.values());
      await this.doSubscribe(subscriptions, options);

      this._logger.info('Broker(Kafka): Consumer successfully recovered');
    } catch (error) {
      this._logger.error('Broker(Kafka): Failed to recover consumer', error);

      // Schedule retry
      setTimeout(() => this.recoverConsumer(options), this._reconnectInterval);
    }
  }

  /**
   * Checks the health of the Kafka consumer.
   * Verifies the consumer's group membership and assignment status.
   *
   * @private
   * @returns {Promise<boolean>} A promise that resolves to true if the consumer is healthy, false otherwise
   */
  private async consumerHealthCheck(): Promise<boolean> {
    if (!this._consumer) return true;

    try {
      const memberAssignment = await this._consumer.describeGroup();
      return !!memberAssignment;
    } catch (error) {
      this._logger.error('Broker(Kafka): Consumer health check failed', error);
      return false;
    }
  }
}
