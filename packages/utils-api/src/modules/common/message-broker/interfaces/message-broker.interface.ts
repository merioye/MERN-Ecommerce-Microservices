import { MessageTopic } from '../enums';
import {
  EventMessage,
  EventMessageMetadata,
  MessageSubscription,
  SubscribeOptions,
  Topic,
} from '../types';

export interface IMessageBroker {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<T>(message: EventMessage<T>): Promise<void>;
  publishBatch<T>(messages: EventMessage<T>[]): Promise<void>;
  subscribe(
    subscriptions: MessageSubscription[],
    options: SubscribeOptions
  ): Promise<void>;
  acknowledgeMsg(metadata: EventMessageMetadata): Promise<void>;
  unsubscribe(topics: MessageTopic | MessageTopic[]): Promise<void>;
  reSubscribe(topics: MessageTopic | MessageTopic[]): Promise<void>;
  createTopics(topics: Topic[]): Promise<void>;
  deleteTopics(topics: MessageTopic[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}
