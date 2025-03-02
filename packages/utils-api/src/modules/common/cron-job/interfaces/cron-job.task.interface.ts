import { CronJobTaskContext } from '../types';

/**
 * Interface representing a cron job task to be implemented by consumers
 *
 * @interface ICronJobTask
 * @template T - Type of the task context
 */
export interface ICronJobTask<T = any> {
  execute(context: CronJobTaskContext<T>): Promise<void>;
  onError?(error: Error, context: CronJobTaskContext<T>): Promise<void>;
}
