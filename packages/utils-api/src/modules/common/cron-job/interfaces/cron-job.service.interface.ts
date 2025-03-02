import { CronJobInfo } from '../types';
import { ICronJobTask } from './cron-job.task.interface';

/**
 * Interface defining the contract for a cron job service implementation
 *
 * @interface ICronJobService
 */
export interface ICronJobService {
  registerTask(name: string, task: ICronJobTask): void;
  getRegisteredJobs(): CronJobInfo[];
}
