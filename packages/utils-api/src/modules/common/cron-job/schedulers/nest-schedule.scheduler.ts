import { Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { ILogger, LOGGER } from '../../logger';
import { ICronJobScheduler } from '../interfaces';
import { CronJobOptions, ScheduleParams } from '../types';

/**
 * Cron Job Scheduler implementation using NestJS Schedule
 *
 * @class NestScheduleScheduler
 * @implements {ICronJobScheduler}
 */
@Injectable()
export class NestScheduleScheduler implements ICronJobScheduler {
  public constructor(
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _schedulerRegistry: SchedulerRegistry
  ) {}

  /**
   * Schedule a new cron job
   * @param params Parameters for scheduling the job
   * @param params.name Unique identifier for the job
   * @param params.cronTime Cron pattern, Date, or interval in milliseconds
   * @param params.callback Function to execute when the job triggers
   * @param params.options Additional job configuration options
   * @returns {void}
   */
  public schedule(params: ScheduleParams): void {
    const { name, cronTime, callback, options } = params;
    try {
      const job = new CronJob(
        cronTime,
        this.createJobCallback(name, callback, options || {}),
        this.createOnCompleteCallback(name, options || {}),
        false,
        options?.timeZone,
        options?.context
      );
      this._schedulerRegistry.addCronJob(
        name,
        job as unknown as CronJob<null, null>
      );
      this._logger.info(
        `Scheduled job: ${name}${options?.description ? ` (${options?.description})` : ''} to run at ${job.nextDate().toJSDate().toISOString()}`
      );

      if (options?.runOnInit) {
        job.start();
      }
    } catch (error) {
      this._logger.error(
        `Failed to schedule job ${name}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
      throw error;
    }
  }

  /**
   * Cancel a scheduled job
   * @param name Job name
   * @returns {void}
   */
  public cancel(name: string): void {
    this._schedulerRegistry.deleteCronJob(name);
  }

  /**
   * Get next scheduled run time for a job
   * @param name Job name
   * @returns Next run Date or undefined if not available
   */
  public getNextRunOfJob(name: string): Date | undefined {
    try {
      const job = this._schedulerRegistry.getCronJob(name);
      return job.nextDate().toJSDate();
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Create a callback function for a job
   * @param name Job name
   * @param callback Function to execute when the job triggers
   * @param options Additional job configuration options
   * @returns {() => Promise<void>}
   */
  private createJobCallback(
    name: string,
    callback: () => Promise<void>,
    options: CronJobOptions
  ): () => Promise<void> {
    return async () => {
      this._logger.info(
        `Executing job: ${name}${options?.description ? ` (${options?.description})` : ''} at ${new Date().toISOString()}`
      );
      if (options?.timeout) {
        await this.executeWithTimeout(name, callback, options.timeout);
      } else {
        await callback();
      }
    };
  }

  /**
   * Execute a job with a timeout
   * @param name Job name
   * @param callback Function to execute when the job triggers
   * @param timeout Timeout in milliseconds
   * @returns {Promise<void>}
   */
  private async executeWithTimeout(
    name: string,
    callback: () => Promise<void>,
    timeout: number
  ): Promise<void> {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Job ${name} timed out after ${timeout}ms`)),
        timeout
      )
    );

    try {
      await Promise.race([callback(), timeoutPromise]);
    } catch (error) {
      this._logger.error(
        error instanceof Error ? error.message : JSON.stringify(error)
      );
      throw error;
    }
  }

  /**
   * Create a callback function to be executed when a job is completed
   * @param name Job name
   * @param options Additional job configuration options
   * @returns {() => void}
   */
  private createOnCompleteCallback(
    name: string,
    options: CronJobOptions
  ): () => void {
    return () => {
      if (options.runOnce) {
        this.cancel(name);
      }
      options.onComplete?.();
    };
  }
}
