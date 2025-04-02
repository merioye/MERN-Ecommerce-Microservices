import { DynamicModule, Module, Provider } from '@nestjs/common';

import { ILogger, LOGGER } from '../logger';
import { KafkaMessageBroker, RabbitMQMessageBroker } from './brokers';
import { MESSAGE_BROKER } from './constants';
import { MessageBroker } from './enums';
import {
  KafkaBrokerConfig,
  MessageBrokerModuleOptions,
  RabbitMQBrokerConfig,
} from './types';

/**
 * A NestJS module that provides message broker functionality.
 * This module can be configured to use supported message brokers
 * as the message broker implementation.
 *
 * @module MessageBrokerModule
 */
@Module({})
export class MessageBrokerModule {
  /**
   * Registers the MessageBrokerModule with the application.
   *
   * @param {MessageBrokerModuleOptions} options - Configuration options for the message broker
   * @returns {DynamicModule} - A dynamically configured NestJS module with the appropriate message broker provider
   * @throws {Error} - Throws an error if an unsupported broker type is specified
   */
  public static register(options: MessageBrokerModuleOptions): DynamicModule {
    /**
     * Provider definition for the message broker service
     */
    const brokerProvider: Provider = {
      provide: MESSAGE_BROKER,
      useFactory: (logger: ILogger) => {
        switch (options.type) {
          case MessageBroker.KAFKA:
            return new KafkaMessageBroker(
              options.config as KafkaBrokerConfig,
              logger
            );
          case MessageBroker.RABBITMQ:
            return new RabbitMQMessageBroker(
              options.config as RabbitMQBrokerConfig,
              logger
            );
          default:
            throw new Error('Broker: Unsupported broker type');
        }
      },
      inject: [LOGGER],
    };

    return {
      global: true,
      module: MessageBrokerModule,
      providers: [brokerProvider],
      exports: [brokerProvider],
    };
  }
}
