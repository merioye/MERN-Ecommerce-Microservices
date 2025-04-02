/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable } from '@nestjs/common';
import {
  ChannelModel,
  ConfirmChannel,
  connect,
  ConsumeMessage,
  Options,
} from 'amqplib';

import { ILogger } from '../../logger';
import { DeadLetterErrorReason, MessageTopic } from '../enums';
import {
  EventMessage,
  EventMessageMetadata,
  MessageSubscription,
  RabbitMQBrokerConfig,
  SubscribeOptions,
  Topic,
} from '../types';
import { BaseMessageBroker } from './base.broker';

/**
 * Implementation of a message broker using RabbitMQ.
 *
 * Handles publishing and subscribing to RabbitMQ exchanges with support for:
 * - Reliable message delivery with retries
 * - Dead letter queues
 * - Automatic reconnection
 * - Health monitoring
 * - Proper message acknowledgment
 * - Comprehensive logging
 *
 * @class RabbitMQMessageBroker
 * @extends {BaseMessageBroker}
 */
@Injectable()
export class RabbitMQMessageBroker extends BaseMessageBroker {
  private _connection: ChannelModel | undefined;
  private _channel: ConfirmChannel | undefined;
  private _connectionPromise: Promise<void> | null = null;
  private _subscriptionOptions: SubscribeOptions | undefined;
  private readonly _subscriptions: Map<string, MessageSubscription> = new Map();
  private readonly _exchangeExists: Set<string> = new Set();
  private readonly _pendingMessages: Array<{
    exchange: string;
    routingKey: string;
    content: Buffer;
    options: Options.Publish;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: unknown) => void;
    retries: number;
  }> = [];
  private _processingPendingMessages: boolean = false;

  /**
   * Creates a new RabbitMQMessageBroker instance.
   *
   * @param {RabbitMQBrokerConfig} config - Configuration options for the RabbitMQ broker
   * @param {ILogger} logger - Logger instance for recording broker activity
   */
  public constructor(config: RabbitMQBrokerConfig, logger: ILogger) {
    super(config, logger);
  }

  /**
   * Establishes connection to RabbitMQ server.
   * Sets up error handling and automatic reconnection.
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
        this._logger.info('Broker(RabbitMQ): Connecting to broker...');

        // Connect to RabbitMQ server
        this._connection = await connect(
          (this._config as RabbitMQBrokerConfig).url,
          {
            ...this._config.tls,
            heartbeat: (this._config as RabbitMQBrokerConfig).heartbeat,
          }
        );

        // Create channel
        this._channel = await this._connection.createConfirmChannel();
        await this._channel.prefetch(1); // Ensure fair dispatch

        this._logger.info(
          'Broker(RabbitMQ): Successfully connected to broker 🚀'
        );

        // Set up connection error handling
        this._connection.on('error', (err) => {
          this._logger.error('Broker(RabbitMQ): Connection error', err);
          void this.handleConnectionError();
        });

        this._connection.on('close', () => {
          this._logger.warn(
            'Broker(RabbitMQ): Connection closed, attempting to reconnect'
          );
          void this.handleConnectionError();
        });

        // Set up channel error handling
        this._channel.on('error', (err) => {
          this._logger.error('Broker(RabbitMQ): Channel error', err);
          void this.handleChannelError();
        });

        this._channel.on('close', () => {
          this._logger.warn(
            'Broker(RabbitMQ): Channel closed, attempting to recover'
          );
          void this.handleChannelError();
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
   * Disconnects from RabbitMQ server.
   * Closes channel and connection.
   *
   * @protected
   * @returns {Promise<void>} A promise that resolves when all connections are closed
   */
  protected async doDisconnect(): Promise<void> {
    this._connectionPromise = null;
    this._exchangeExists.clear();

    const disconnectPromises = [];

    if (this._channel) {
      disconnectPromises.push(
        this._channel
          .close()
          .catch((err) =>
            this._logger.error('Broker(RabbitMQ): Error closing channel', err)
          )
      );
      this._channel = undefined;
    }

    if (this._connection) {
      disconnectPromises.push(
        this._connection
          .close()
          .catch((err) =>
            this._logger.error(
              'Broker(RabbitMQ): Error closing connection',
              err
            )
          )
      );
      this._connection = undefined;
    }

    this._subscriptions.clear();

    await Promise.all(disconnectPromises);
  }

  /**
   * Publishes a single message to a RabbitMQ exchange.
   * Ensures the exchange exists before publishing.
   *
   * @protected
   * @template T - Type of the message value
   * @param {EventMessage<T>} param0 - Message object containing topic(exchange), value and config
   * @param {MessageTopic} param0.topic - The topic(exchange) to publish to
   * @param {T} param0.value - The message payload
   * @param {Object} [param0.config] - Additional configuration for the message
   * @returns {Promise<void>} A promise that resolves when the message is published
   */
  protected async doPublish<T>({
    topic,
    value,
    config,
  }: EventMessage<T>): Promise<void> {
    const exchange = topic?.toString();
    const maxRetries = config?.retries ?? this._reconnectAttempts;

    const content = Buffer.from(JSON.stringify(value));
    const options = {
      persistent: true, // Make message persistent
      headers: config?.headers,
      timestamp: config?.timestamp,
    };

    return new Promise((resolve, reject) => {
      void (async (): Promise<void> => {
        try {
          // Ensure exchange exists
          try {
            await this.ensureExchangeExists(exchange);
          } catch (error) {
            return reject(
              new Error(
                `Broker(RabbitMQ): Failed to ensure exchange exists: ${(error as Error)?.message}`
              )
            );
          }

          // Try to publish if channel is available
          if (this._channel) {
            try {
              await this.publishWithRetry(
                exchange,
                config?.key || '',
                content,
                options,
                maxRetries
              );
              return resolve();
            } catch (error) {
              this._logger.error(
                `Broker(RabbitMQ): Failed to publish message to exchange ${exchange} after ${maxRetries} attempts`,
                error
              );
              return reject(error);
            }
          } else {
            // Queue message for later
            this._logger.debug(
              `Broker(RabbitMQ): Channel not ready, queuing message to exchange ${exchange}`
            );
            this._pendingMessages.push({
              exchange,
              routingKey: config?.key || '',
              content,
              options,
              resolve,
              reject,
              retries: maxRetries,
            });

            // Try to connect if not already connecting
            if (!this._connectionPromise) {
              this.doConnect().catch((err) => {
                this._logger.error(
                  'Broker(RabbitMQ): Failed to connect while processing pending message',
                  err
                );
              });
            }
          }
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  /**
   * Publishes multiple messages in a batch.
   * Uses individual publishes but within a single channel operation.
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

    // Ensure all exchanges exist first
    const exchanges = new Set(messages.map((m) => m.topic.toString()));
    for (const exchange of exchanges) {
      await this.ensureExchangeExists(exchange);
    }

    try {
      // Publish all messages
      for (const message of messages) {
        const exchange = message.topic.toString();
        const content = Buffer.from(JSON.stringify(message.value));
        const options = {
          persistent: true,
          headers: message.config?.headers,
          timestamp: message.config?.timestamp,
        };

        this._channel?.publish(
          exchange,
          message.config?.key || '',
          content,
          options
        );
      }

      // Wait for all messages to be acknowledged by the broker
      await this._channel?.waitForConfirms();

      this._logger.debug(
        `Broker: Successfully published batch of ${messages.length} messages`
      );
    } catch (error) {
      this._logger.error(
        `Broker: Failed to publish batch of ${messages.length} messages`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribes to one or more RabbitMQ exchanges.
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
    this._subscriptionOptions = options;
    if (!this._channel) {
      // Create channel
      this._channel = await this._connection?.createConfirmChannel();
      await this._channel?.prefetch(1); // Ensure fair dispatch

      // Set up channel error handling
      this._channel?.on('error', (err) => {
        this._logger.error('Broker(RabbitMQ): Channel error', err);
        void this.handleChannelError();
      });

      this._channel?.on('close', () => {
        this._logger.warn(
          'Broker(RabbitMQ): Channel closed, attempting to recover'
        );
        void this.handleChannelError();
      });
    }

    // Configure dead letter exchange if retry is enabled
    let deadLetterExchange: string | undefined;
    if (options.retry && options.retry.maxRetries > 0) {
      deadLetterExchange = `${options.groupId}-dead-letter`;
      await this.ensureExchangeExists(deadLetterExchange, 'fanout');
    }

    // Subscribe to all exchanges
    for (const { topic, config } of subscriptions) {
      const exchange = topic.toString();
      const queue = `${options.groupId}-${exchange}`;

      // Ensure exchange exists
      await this.ensureExchangeExists(exchange);

      // Declare queue with dead letter exchange if configured
      const queueOptions: Options.AssertQueue = {
        durable: true,
      };

      if (deadLetterExchange) {
        queueOptions.arguments = {
          'x-dead-letter-exchange': deadLetterExchange,
        };
      }

      await this._channel?.assertQueue(queue, queueOptions);
      await this._channel?.bindQueue(queue, exchange, '#');

      // Store subscription for possible recovery
      this._subscriptions.set(exchange, {
        topic,
        handler: subscriptions.find((s) => s.topic === topic)!.handler,
        config,
      });

      // Set up message handler
      await this._channel?.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          const subscription = this._subscriptions.get(exchange);
          if (!subscription) {
            this._logger.warn(
              `Broker(RabbitMQ): Received message for unsubscribed exchange: ${exchange}`
            );
            return;
          }

          let retryCount = 0;
          let parsedMessage: EventMessage;

          try {
            // Check if this is a retry message
            if (msg.properties.headers?.retryCount) {
              retryCount = parseInt(
                (msg.properties.headers.retryCount as number).toString(),
                10
              );
            }

            // Parse message
            try {
              parsedMessage = {
                topic: topic,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value: JSON.parse(msg.content.toString()),
                config: {
                  key: msg.fields.routingKey,
                  headers: msg.properties.headers as Record<string, string>,
                  timestamp: msg.properties.timestamp as number,
                },
                metadata: {
                  topic: exchange,
                  partition: 0, // RabbitMQ doesn't have partitions
                  offset: msg.fields.deliveryTag.toString(),
                },
              };
            } catch (parseError) {
              this._logger.error(
                `Broker(RabbitMQ): Failed to parse message: ${msg.content.toString()}`,
                parseError
              );
              // Send to dead letter if parsing fails (can't retry)
              if (deadLetterExchange) {
                await this.sendToDeadLetter(
                  deadLetterExchange,
                  msg,
                  exchange,
                  DeadLetterErrorReason.PARSE_ERROR,
                  parseError as Error
                );
              }
              this._channel?.ack(msg);
              return;
            }

            // Process message with handler
            await subscription.handler(parsedMessage);

            // Acknowledge successful processing
            if (options?.autoCommit !== false) {
              this._channel?.ack(msg);
              if (retryCount > 0) {
                this._logger.info(
                  `Broker(RabbitMQ): Successfully processed message from exchange ${exchange} after ${retryCount} retries`
                );
              }
            } else {
              // Manual commit if autoCommit is false
              // Don't commit here - leave it to the subscriber to call acknowledgeMsg
            }
          } catch (error) {
            this._logger.error(
              `Broker(RabbitMQ): Error processing message from exchange ${exchange} (retry ${retryCount})`,
              error
            );

            // Retry logic
            if (options?.retry && retryCount < options.retry.maxRetries) {
              try {
                // Reject message for requeue
                this._channel?.reject(msg, false);

                // Prepare message for retry
                const retryMessage = {
                  content: msg.content,
                  properties: {
                    ...msg.properties,
                    headers: {
                      ...msg.properties.headers,
                      retryCount: (retryCount + 1).toString(),
                      errorMessage:
                        (error as Error)?.message?.substring(0, 256) ||
                        'Unknown error',
                      lastRetryTimestamp: Date.now().toString(),
                    },
                  },
                };

                // Wait for backoff period
                const backoffTime =
                  options.retry.backoff * Math.pow(2, retryCount);
                await new Promise((resolve) =>
                  setTimeout(resolve, backoffTime)
                );

                // Publish retry message
                this._channel?.publish(
                  exchange,
                  msg.fields.routingKey,
                  retryMessage.content,
                  retryMessage.properties
                );

                this._logger.info(
                  `Broker(RabbitMQ): Scheduled retry ${retryCount + 1}/${options.retry.maxRetries} for message in exchange ${exchange}`
                );
              } catch (retryError) {
                this._logger.error(
                  'Broker(RabbitMQ): Failed to schedule retry for message',
                  retryError
                );

                // Send to dead letter if retry fails
                if (deadLetterExchange) {
                  await this.sendToDeadLetter(
                    deadLetterExchange,
                    msg,
                    exchange,
                    DeadLetterErrorReason.RETRY_FAILED,
                    error as Error
                  );
                }
                this._channel?.ack(msg);
              }
            } else {
              // Max retries exceeded or retry not configured
              if (deadLetterExchange) {
                await this.sendToDeadLetter(
                  deadLetterExchange,
                  msg,
                  exchange,
                  DeadLetterErrorReason.MAX_RETRIES_EXCEEDED,
                  error as Error
                );
              }
              this._channel?.ack(msg);
            }
          }
        },
        { noAck: false } // Enable manual acknowledgment
      );
    }

    const exchangesArray = Array.from(this._subscriptions.keys());
    this._logger.info(
      `Broker(RabbitMQ): Successfully subscribed to exchanges: ${exchangesArray.join(', ')}`
    );
  }

  /**
   * Acknowledges a message has been processed.
   *
   * @protected
   * @param {EventMessageMetadata} metadata - Metadata for the message to acknowledge
   * @returns {Promise<void>} A promise that resolves when the offset is committed
   */
  protected async doAcknowledgeMsg(
    metadata: EventMessageMetadata
  ): Promise<void> {
    if (!this._channel) {
      throw new Error('Broker(RabbitMQ): Channel not available');
    }

    this._channel.ack({
      fields: { deliveryTag: parseInt(metadata.offset) },
    } as ConsumeMessage);

    return Promise.resolve();
  }

  /**
   * Unsubscribes from topics(exchanges) by cancelling consumers.
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics(exchanges) to unsubscribe from
   * @returns {Promise<void>} A promise that resolves when unsubscribed
   */
  protected async doUnsubscribe(topics: MessageTopic[]): Promise<void> {
    if (!this._channel) return;

    try {
      for (const topic of topics) {
        const exchange = topic.toString();
        if (this._subscriptions.has(exchange)) {
          await this._channel.cancel(exchange);
          this._subscriptions.delete(exchange);
        }
      }
      this._logger.info(
        `Broker(RabbitMQ): Successfully unsubscribed from exchanges: ${topics.join(
          ', '
        )}`
      );
    } catch (error) {
      this._logger.error(
        `Broker(RabbitMQ): Failed to unsubscribe from exchanges: ${topics.join(', ')}`,
        error
      );
      throw error;
    }
  }

  /**
   * Resubscribes to topics(exchanges) after a connection recovery.
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics(exchanges) to resume subscription to
   * @returns {Promise<void>} A promise that resolves when resubscribed
   */
  protected async doReSubscribe(): Promise<void> {
    // Implementation depends on how subscriptions are stored
    // This is a placeholder for the actual implementation
    this._logger.info('Broker: Resubscribe not implemented yet');
    return Promise.resolve();
  }

  /**
   * Creates topics (exchanges in RabbitMQ).
   *
   * @protected
   * @param {Topic[]} topics - Array of topics(exchanges) to create with their configurations
   * @returns {Promise<void>} A promise that resolves when topics(exchanges) are created
   */
  protected async doCreateTopics(topics: Topic[]): Promise<void> {
    if (!this._channel) {
      throw new Error('Broker(RabbitMQ): Channel not available');
    }

    try {
      for (const { topic } of topics) {
        const exchange = topic.toString();
        await this.ensureExchangeExists(exchange);
      }

      this._logger.info(
        `Broker(RabbitMQ): Created topics: ${topics.map((t) => t.topic).join(', ')}`
      );
    } catch (error) {
      this._logger.error(
        `Broker(RabbitMQ): Failed to create topics: ${topics.map((t) => t.topic).join(', ')}`,
        error
      );
      throw error;
    }
  }

  /**
   * Deletes topics (exchanges in RabbitMQ).
   *
   * @protected
   * @param {MessageTopic[]} topics - Array of topics(exchanges) to delete
   * @returns {Promise<void>} A promise that resolves when topics(exchanges) are deleted
   */
  protected async doDeleteTopics(topics: MessageTopic[]): Promise<void> {
    if (!this._channel) {
      throw new Error('Broker(RabbitMQ): Channel not available');
    }

    try {
      for (const topic of topics) {
        const exchange = topic.toString();
        await this._channel.deleteExchange(exchange);
        this._exchangeExists.delete(exchange);
      }

      this._logger.info(
        `Broker(RabbitMQ): Deleted topics: ${topics.join(', ')}`
      );
    } catch (error) {
      this._logger.error(
        `Broker(RabbitMQ): Failed to delete topics: ${topics.join(', ')}`,
        error
      );
      throw error;
    }
  }

  /**
   * Checks the health of the broker connection.
   *
   * @protected
   * @returns {Promise<boolean>}
   */
  protected async doHealthCheck(): Promise<boolean> {
    try {
      let connectionHealthy = false;
      let channelHealthy = false;

      // Check if connection exists
      if (this._connection) {
        connectionHealthy = true;
      }

      if (this._channel) {
        // Using a random queue name (or you can use a dedicated health check queue name)
        await this._channel.assertQueue('rabbitmq_healthcheck_queue', {
          durable: false,
        });
        channelHealthy = true;
      }

      const isHealthy = connectionHealthy && channelHealthy;
      this._logger.debug(
        `Broker(RabbitMQ) health check: ${isHealthy ? 'healthy' : 'unhealthy'} (connection: ${connectionHealthy}, channel: ${channelHealthy})`
      );

      return isHealthy;
    } catch (error) {
      this._logger.error('Broker(RabbitMQ): Health check failed', error);
      return false;
    }
  }

  /**
   * Ensures an exchange exists, creating it if necessary.
   *
   * @private
   * @param {string} exchange - Name of the exchange
   * @param {string} [type='topic'] - Type of the exchange
   * @returns {Promise<void>} A promise that resolves when the exchange is ensured
   */
  private async ensureExchangeExists(
    exchange: string,
    type: string = 'topic'
  ): Promise<void> {
    if (!this._channel) {
      throw new Error('Broker(RabbitMQ): Channel not available');
    }

    if (!this._exchangeExists.has(exchange)) {
      await this._channel.assertExchange(exchange, type, {
        durable: true,
      });
      this._exchangeExists.add(exchange);
    }
  }

  /**
   * Publishes a message with retry logic.
   *
   * @private
   * @param {string} exchange - Name of the exchange
   * @param {string} routingKey - Routing key for the message
   * @param {Buffer} content - Content of the message
   * @param {Options.Publish} options - Options for the message
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<void>} A promise that resolves when the message is published
   */
  private async publishWithRetry(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: Options.Publish,
    maxRetries: number
  ): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (!this._channel) {
          throw new Error('Broker(RabbitMQ): Channel not available');
        }

        this._channel.publish(exchange, routingKey, content, options);
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw new Error(
      `Broker(RabbitMQ): Failed to publish message after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Processes any pending messages after reconnection.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when pending messages are processed
   */
  private async processPendingMessages(): Promise<void> {
    if (this._processingPendingMessages || !this._channel) return;

    this._processingPendingMessages = true;
    this._logger.info(
      `Broker(RabbitMQ): Processing ${this._pendingMessages.length} pending messages`
    );
    try {
      while (this._pendingMessages.length > 0 && this._channel) {
        const message = this._pendingMessages.shift();
        if (!message) continue;

        try {
          await this.publishWithRetry(
            message.exchange,
            message.routingKey,
            message.content,
            message.options,
            message.retries
          );
          message.resolve();
        } catch (error) {
          this._logger.error(
            `Broker(RabbitMQ): Failed to process pending message to exchange ${message.exchange}`,
            error
          );
          message.reject(error);
        }
      }
    } finally {
      this._processingPendingMessages = false;
    }
  }

  /**
   * Handles connection errors and attempts recovery.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when the connection is handled
   */
  private async handleConnectionError(): Promise<void> {
    this._connection = undefined;
    this._channel = undefined;
    this._connectionPromise = null;

    // Attempt to reconnect
    for (let attempt = 1; attempt <= this._reconnectAttempts; attempt++) {
      try {
        await this.doConnect();
        return;
      } catch (error) {
        this._logger.error(
          `Broker(RabbitMQ): Reconnection attempt ${attempt}/${this._reconnectAttempts} failed`,
          error
        );
        if (attempt < this._reconnectAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this._reconnectInterval)
          );
        }
      }
    }

    this._logger.error(
      `Broker(RabbitMQ): Failed to reconnect after ${this._reconnectAttempts} attempts`
    );
  }

  /**
   * Handles channel errors and attempts recovery.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when the channel is handled
   */
  private async handleChannelError(): Promise<void> {
    this._channel = undefined;

    if (!this._connection) {
      await this.handleConnectionError();
      return;
    }

    try {
      this._channel = await this._connection.createConfirmChannel();
      await this._channel.prefetch(1);

      // Resubscribe to all exchanges
      const subscriptions = Array.from(this._subscriptions.values());
      if (subscriptions.length > 0) {
        await this.doSubscribe(
          subscriptions,
          this._subscriptionOptions ?? {
            groupId: 'recovered-group', // This should be stored and recovered
          }
        );
      }
      this._logger.info(`Broker(RabbitMQ): Channel recovered successfully`);
    } catch (error) {
      this._logger.error('Broker(RabbitMQ): Failed to recover channel', error);
      await this.handleConnectionError();
    }
  }

  /**
   * Sends a message to the dead letter exchange.
   *
   * @private
   * @param {string} deadLetterExchange - Name of the dead letter exchange
   * @param {ConsumeMessage} message - The original message
   * @param {string} originalExchange - Name of the original exchange
   * @param {DeadLetterErrorReason} reason - Reason for sending to dead letter
   * @param {Error} error - The error that caused the message to be sent to dead letter
   * @returns {Promise<void>} A promise that resolves when the message is sent to dead letter
   */
  private async sendToDeadLetter(
    deadLetterExchange: string,
    message: ConsumeMessage,
    originalExchange: string,
    reason: DeadLetterErrorReason,
    error: Error
  ): Promise<void> {
    try {
      if (!this._channel) {
        throw new Error('Broker(RabbitMQ): Channel not available');
      }

      const headers = {
        ...message.properties.headers,
        'x-original-exchange': originalExchange,
        'x-death-reason': reason,
        'x-error-message': error.message,
        'x-death-time': new Date().toISOString(),
      };

      this._channel.publish(deadLetterExchange, '', message.content, {
        ...message.properties,
        headers,
      });

      this._logger.info(
        `Broker(RabbitMQ): Message sent to dead letter exchange ${deadLetterExchange}`
      );

      return Promise.resolve();
    } catch (dlqError) {
      this._logger.error(
        'Broker(RabbitMQ): Failed to send message to dead letter exchange',
        dlqError
      );
    }
  }
}
