import { CronJobStatus } from '../enums';

/**
 * Options for configuring cron job behavior
 */
export type CronJobOptions = {
  /**
   * Timezone for the cron execution
   * @example 'Europe/Paris'
   */
  timeZone?: string;
  /**
   * Run the job only once
   * @default false
   */
  runOnce?: boolean;
  /**
   * Timeout in milliseconds after which the job will be canceled
   */
  timeout?: number;
  /**
   * Human-readable description of the job
   */
  description?: string;
  /**
   * Callback to execute when the job completes successfully
   */
  onComplete?: () => void;
  /**
   * Run the job immediately when created
   * @default false
   */
  runOnInit?: boolean;
};

/**
 * Configuration for individual cron jobs
 */
export type CronJobConfig = CronJobOptions & {
  /**
   * Unique identifier for the job
   */
  name: string;
  /**
   * Schedule configuration (cron pattern, Date)
   */
  schedule: string | Date;
  /**
   * Context data passed to the task execution
   */
  context?: Record<string, any>;
};

/**
 * Configuration options for the CronModule
 */
export interface CronJobModuleOptions {
  /**
   * List of cron job configurations
   */
  jobs: CronJobConfig[];
  /**
   * Global options applied to all jobs
   */
  globalOptions?: Partial<CronJobOptions>;
}

/**
 * Parameters for scheduling a cron job
 */
export type ScheduleParams = {
  name: string;
  cronTime: string | Date;
  callback: () => Promise<void>;
  options?: CronJobConfig;
};

/**
 * Context for the task execution
 */
export type CronJobTaskContext<T = any> = {
  jobName: string;
  timestamp: Date;
  params?: T;
};

/**
 * State of a cron job
 */
export type CronJobState = {
  /**
   * Current status of the job
   */
  status: CronJobStatus;
  /**
   * Last error encountered during execution
   */
  lastError?: string;
  /**
   * Last execution time
   */
  lastExecution?: Date;
  /**
   * Number of times the job has been executed
   */
  executionCount: number;
  /**
   * Number of times the job has encountered an error
   */
  errorCount: number;
};

/**
 * Information about a cron job
 */
export type CronJobInfo = CronJobConfig &
  CronJobState & {
    /**
     * Whether the task implementation is registered
     */
    isTaskRegistered: boolean;
    /**
     * Next scheduled run time (if available)
     */
    nextRun?: Date;
  };
