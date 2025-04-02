export enum SaslMechanism {
  PLAIN = 'plain',
  SCRAM_SHA_256 = 'scram-sha-256',
  SCRAM_SHA_512 = 'scram-sha-512',
}

export enum MessageTopic {}

export enum MessageBroker {
  KAFKA = 'kafka',
  RABBITMQ = 'rabbitmq',
}

export enum SubscribeFrom {
  EARLIEST = 'earliest',
  LATEST = 'latest',
}

export enum DeadLetterErrorReason {
  PARSE_ERROR = 'PARSE_ERROR',
  RETRY_FAILED = 'RETRY_FAILED',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
}
