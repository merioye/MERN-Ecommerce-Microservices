import { Inject } from '@nestjs/common';

import { MESSAGE_BROKER } from '../constants';

/**
 * Custom decorator that injects the message broker instance.
 *
 * @returns {PropertyDecorator & ParameterDecorator} - A decorator that injects the message broker instance.
 */
export const InjectMessageBroker = (): PropertyDecorator & ParameterDecorator =>
  Inject(MESSAGE_BROKER);
