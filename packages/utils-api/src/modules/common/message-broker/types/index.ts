import {
  MessageBroker,
  MessageTopic,
  SaslMechanism,
  SubscribeFrom,
} from '../enums';

export type BaseBrokerConfig = {
  maxRetries?: number;
  retryInterval?: number;
  timeout?: number;
  tls?: {
    ca: string;
    cert: string;
    key: string;
  };
};

export type KafkaBrokerConfig = BaseBrokerConfig & {
  clientId: string;
  brokers: string[];
  sasl?: {
    mechanism: SaslMechanism;
    username: string;
    password: string;
  };
};

export type RabbitMQBrokerConfig = BaseBrokerConfig & {
  url: string;
  heartbeat?: number;
};

export type BrokerConfig = KafkaBrokerConfig | RabbitMQBrokerConfig;

export type SubscribeOptions = {
  groupId: string;
  autoCommit?: boolean;
  retry?: {
    maxRetries: number;
    backoff: number;
  };
};

export type SubscriptionConfig = {
  subscribeFrom: SubscribeFrom;
  maxBatchSize?: number;
};

export type MessageSubscription = {
  topic: MessageTopic;
  handler: <T>(message: EventMessage<T>) => Promise<void>;
  config: SubscriptionConfig;
};

export type TopicConfig = {
  partitions?: number;
  replicationFactor?: number;
  retentionsMs?: number;
};

export type Topic = {
  topic: MessageTopic;
  config?: TopicConfig;
};

export type EventMessageConfig = {
  partition?: number;
  key?: string;
  headers?: Record<string, string>;
  timestamp?: number;
  retries?: number;
};

export interface EventMessageMetadata {
  topic: string;
  partition: number;
  offset: string;
}

export type EventMessage<T = any> = {
  topic: MessageTopic;
  value: T;
  config?: EventMessageConfig;
  metadata?: EventMessageMetadata;
};

export type MessageBrokerModuleOptions = {
  type: MessageBroker;
  config: BrokerConfig;
};
