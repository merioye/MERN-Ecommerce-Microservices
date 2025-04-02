import { ILogger } from '../../logger';
import { MessageTopic } from '../enums';
import { IMessageBroker } from '../interfaces';
import {
  BrokerConfig,
  EventMessage,
  EventMessageMetadata,
  MessageSubscription,
  SubscribeOptions,
  Topic,
} from '../types';

/**
 * Base implementation of a message broker that handles common functionality
 * and provides a template for specific broker implementations.
 *
 * @abstract
 * @class BaseMessageBroker
 * @implements {IMessageBroker}
 */
export abstract class BaseMessageBroker implements IMessageBroker {
  protected _connected: boolean = false;
  protected readonly _reconnectAttempts!: number;
  protected readonly _reconnectInterval!: number;

  public constructor(
    protected readonly _config: BrokerConfig,
    protected readonly _logger: ILogger
  ) {
    this._reconnectAttempts = _config.maxRetries ?? 5;
    this._reconnectInterval = _config.retryInterval ?? 5000;
  }

  protected abstract doConnect(): Promise<void>;
  protected abstract doDisconnect(): Promise<void>;
  protected abstract doPublish<T>(message: EventMessage<T>): Promise<void>;
  protected abstract doPublishBatch<T>(
    messages: EventMessage<T>[]
  ): Promise<void>;
  protected abstract doSubscribe(
    subscriptions: MessageSubscription[],
    options: SubscribeOptions
  ): Promise<void>;
  protected abstract doAcknowledgeMsg(
    metadata: EventMessageMetadata
  ): Promise<void>;
  protected abstract doUnsubscribe(topics: MessageTopic[]): Promise<void>;
  protected abstract doReSubscribe(topics: MessageTopic[]): Promise<void>;
  protected abstract doCreateTopics(topics: Topic[]): Promise<void>;
  protected abstract doDeleteTopics(topics: MessageTopic[]): Promise<void>;
  protected abstract doHealthCheck(): Promise<boolean>;

  /**
   * Connects to the message broker
   *
   * @public
   * @returns {Promise<void>}
   * @throws {Error} If connection fails
   */
  public async connect(): Promise<void> {
    try {
      await this.doConnect();
      this._connected = true;
      this._logger.info('Broker: Successfully connected 🚀');
    } catch (error) {
      this._logger.error('Broker: Failed to connect', error);
      throw error;
    }
  }

  /**
   * Disconnects from the message broker
   *
   * @public
   * @returns {Promise<void>}
   * @throws {Error} If disconnection fails
   */
  public async disconnect(): Promise<void> {
    try {
      this._logger.info('Broker: Disconnecting...');
      await this.doDisconnect();
      this._connected = false;
      this._logger.info('Broker: Successfully disconnected');
    } catch (error) {
      this._logger.error('Broker: Failed to disconnect', error);
      throw error;
    }
  }

  /**
   * Publishes a message to the specified topic
   *
   * @public
   * @template T - Type of the message payload
   * @param {EventMessage<T>} message - The message to publish
   * @returns {Promise<void>}
   * @throws {Error} If publishing fails
   */
  public async publish<T>(message: EventMessage<T>): Promise<void> {
    try {
      await this.doPublish<T>(message);
      this._logger.debug(`Broker: Published message to topic ${message.topic}`);
    } catch (error) {
      this._logger.error(
        `Broker: Failed to publish message to topic ${message.topic}`,
        error
      );
      throw error;
    }
  }

  /**
   * Publishes multiple messages in batch
   *
   * @public
   * @template T - Type of the message payload
   * @param {EventMessage<T>[]} messages - Array of messages to publish
   * @returns {Promise<void>}
   * @throws {Error} If batch publishing fails
   */
  public async publishBatch<T>(messages: EventMessage<T>[]): Promise<void> {
    try {
      await this.doPublishBatch<T>(messages);
    } catch (error) {
      this._logger.error(
        `Broker: Failed to publish batch of ${messages.length} messages`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribes to multiple topics with specified options
   *
   * @public
   * @param {MessageSubscription[]} subscriptions - Array of subscriptions
   * @param {SubscribeOptions} options - Options for the subscription
   * @returns {Promise<void>}
   * @throws {Error} If subscription fails
   */
  public async subscribe(
    subscriptions: MessageSubscription[],
    options: SubscribeOptions
  ): Promise<void> {
    try {
      await this.doSubscribe(subscriptions, options);
    } catch (error) {
      this._logger.error('Broker: Failed to subscribe to topics', error);
      throw error;
    }
  }

  /**
   * Acknowledges a message has been processed
   *
   * @public
   * @param {EventMessageMetadata} metadata - Metadata of the message to acknowledge
   * @returns {Promise<void>}
   * @throws {Error} If acknowledgment fails
   */
  public async acknowledgeMsg(metadata: EventMessageMetadata): Promise<void> {
    try {
      await this.doAcknowledgeMsg(metadata);
      this._logger.debug(
        `Broker: Message acknowledgment successfully on topic ${metadata.topic} with offset ${metadata.offset}`
      );
    } catch (error) {
      this._logger.error(`Broker: Failed to acknowledge message`, error);
      throw error;
    }
  }

  /**
   * Unsubscribes from one or more topics
   *
   * @public
   * @param {MessageTopic | MessageTopic[]} topics - Topic(s) to unsubscribe from
   * @returns {Promise<void>}
   * @throws {Error} If unsubscribe operation fails
   */
  public async unsubscribe(
    topics: MessageTopic | MessageTopic[]
  ): Promise<void> {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    try {
      await this.doUnsubscribe(topicsArray);
      this._logger.info(
        `Broker: Unsubscribed from topics ${topicsArray?.toString()}`
      );
    } catch (error) {
      this._logger.error(
        `Broker: Failed to unsubscribe from topics ${topicsArray?.toString()}`,
        error
      );
      throw error;
    }
  }

  /**
   * Re-subscribes to previously subscribed topics
   *
   * @public
   * @param {MessageTopic | MessageTopic[]} topics - Topic(s) to resubscribe to
   * @returns {Promise<void>}
   * @throws {Error} If resubscribe operation fails
   */
  public async reSubscribe(
    topics: MessageTopic | MessageTopic[]
  ): Promise<void> {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    try {
      await this.doReSubscribe(topicsArray);
      this._logger.info(
        `Broker: Re-subscribed to topics ${topicsArray?.toString()}`
      );
    } catch (error) {
      this._logger.error(
        `Broker: Failed to re-subscribe to topics ${topicsArray?.toString()}`,
        error
      );
      throw error;
    }
  }

  /**
   * Creates new topics in the message broker
   *
   * @public
   * @param {Topic[]} topics - Array of topics to create
   * @returns {Promise<void>}
   * @throws {Error} If topic creation fails
   */
  public async createTopics(topics: Topic[]): Promise<void> {
    try {
      await this.doCreateTopics(topics);
    } catch (error) {
      this._logger.error(
        `Broker: Failed to create topics ${topics?.toString()}`,
        error
      );
      throw error;
    }
  }

  /**
   * Deletes topics from the message broker
   *
   * @public
   * @param {MessageTopic[]} topics - Array of topics to delete
   * @returns {Promise<void>}
   * @throws {Error} If topic deletion fails
   */
  public async deleteTopics(topics: MessageTopic[]): Promise<void> {
    try {
      await this.doDeleteTopics(topics);
    } catch (error) {
      this._logger.error(
        `Broker: Failed to delete topics ${topics?.toString()}`,
        error
      );
      throw error;
    }
  }

  /**
   * Checks the health of the broker connection
   *
   * @public
   * @returns {Promise<boolean>} - True if the broker is healthy, false otherwise
   * @throws {Error} If health check fails
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return await this.doHealthCheck();
    } catch (error) {
      this._logger.error('Broker: Failed to check health', error);
      throw error;
    }
  }
}
