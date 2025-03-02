import { Injectable, OnModuleInit } from '@nestjs/common';

import { ILogger } from '../../logger';
import { CronJobStatus } from '../enums';
import {
  ICronJobScheduler,
  ICronJobService,
  ICronJobTask,
} from '../interfaces';
import {
  CronJobConfig,
  CronJobInfo,
  CronJobOptions,
  CronJobState,
} from '../types';

type CronJobStateWithLastError = Omit<CronJobState, 'lastError'> & {
  lastError?: Error;
};

/**
 * Service for managing and executing cron jobs
 *
 * @class CronJobService
 * @implements {ICronJobService, OnModuleInit}
 */
@Injectable()
export class CronJobService implements ICronJobService, OnModuleInit {
  /**
   * Map of registered tasks
   * @private
   */
  private _tasks = new Map<string, ICronJobTask>();

  /**
   * Map of job states
   * @private
   */
  private _jobStateMap = new Map<string, CronJobStateWithLastError>();

  public constructor(
    private readonly _logger: ILogger,
    private readonly _jobScheduler: ICronJobScheduler,
    private readonly _jobs: CronJobConfig[],
    private readonly _globalOptions?: Partial<CronJobOptions>
  ) {}

  /**
   * Initialize the cron jobs on module initialization
   * @returns {void}
   */
  public onModuleInit(): void {
    this.initializeJobs();
  }

  /**
   * Register a task implementation for a job
   * @param name Job name to associate with the task
   * @param task Task implementation
   * @returns {void}
   */
  public registerTask(name: string, task: ICronJobTask): void {
    if (this._tasks.has(name)) {
      this._logger.warn(
        `Task ${name} is already registered. Overwriting existing task.`
      );
    }
    this._tasks.set(name, task);
  }

  /**
   * Get information about all registered jobs
   * @returns Array of job information with registration status
   */
  public getRegisteredJobs(): CronJobInfo[] {
    return this._jobs.map((job) => {
      const state = this._jobStateMap.get(job.name) || {
        status: CronJobStatus.INACTIVE,
        executionCount: 0,
        errorCount: 0,
      };
      const isRegistered = this._tasks.has(job.name);

      return {
        ...job,
        isTaskRegistered: isRegistered,
        status: isRegistered ? state.status : CronJobStatus.INACTIVE,
        nextRun: this._jobScheduler.getNextRunOfJob(job.name),
        lastExecution: state.lastExecution,
        lastError: state.lastError?.message,
        executionCount: state.executionCount,
        errorCount: state.errorCount,
      };
    });
  }

  /**
   * Initialize the cron jobs
   * @returns {void}
   */
  private initializeJobs(): void {
    this._jobs.forEach((job) => this.scheduleJob(job));
  }

  /**
   * Schedule a job
   * @param job Job configuration
   * @returns {void}
   */
  private scheduleJob(job: CronJobConfig): void {
    if (!this._tasks.has(job.name)) {
      this._logger.error(
        `Task ${job.name} not registered. Job will not be scheduled.`
      );
      return;
    }

    const mergedOptions: CronJobConfig = {
      ...this._globalOptions,
      ...job,
    };

    try {
      this._jobScheduler.schedule({
        name: job.name,
        cronTime: job.schedule,
        callback: this.createJobExecutor(job.name, mergedOptions.context),
        options: mergedOptions,
      });
    } catch (error) {
      this._logger.error(
        `Failed to schedule job ${job.name}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
    }
  }

  /**
   * Create a job executor
   * @param name Job name
   * @param context Context for the job
   * @returns {() => Promise<void>}
   */
  private createJobExecutor(
    name: string,
    context: Record<string, any> = {}
  ): () => Promise<void> {
    return async () => {
      const task = this._tasks.get(name);
      if (!task) {
        this._logger.error(`Task ${name} not found`);
        return;
      }

      const state = this._jobStateMap.get(name) || {
        status: CronJobStatus.ACTIVE,
        executionCount: 0,
        errorCount: 0,
      };

      try {
        state.lastExecution = new Date();
        // Pass both context and job metadata
        await task.execute({
          jobName: name,
          timestamp: new Date(),
          params: context,
        });

        // Update state on success
        state.status = CronJobStatus.ACTIVE;
        state.executionCount++;
      } catch (error) {
        // Update state on error
        state.status = CronJobStatus.ERROR;
        state.lastError = error as Error;
        state.errorCount++;

        this._logger.error(
          `Job ${name} execution failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`
        );
        if (task.onError) {
          await task.onError(error as Error, {
            jobName: name,
            timestamp: new Date(),
            params: context,
          });
        }
      }
      this._jobStateMap.set(name, state);
    };
  }
}
