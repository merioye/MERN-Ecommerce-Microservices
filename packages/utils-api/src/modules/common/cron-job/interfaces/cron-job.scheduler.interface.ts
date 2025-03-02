import { ScheduleParams } from '../types';

/**
 * Interface defining the contract for a cron job scheduler implementation
 *
 * @interface ICronJobScheduler
 */
export interface ICronJobScheduler {
  schedule(params: ScheduleParams): void;
  cancel(name: string): void;
  getNextRunOfJob(name: string): Date | undefined;
}
