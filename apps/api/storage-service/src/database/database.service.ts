import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Service class for managing database connections
 * @class DatabaseService
 */
@Injectable()
export class DatabaseService {
  public constructor(
    @InjectConnection() private readonly _connection: Connection
  ) {}

  /**
   * Checks database connection health
   * @returns boolean indicating if database is healthy
   */
  public async ping(): Promise<boolean> {
    try {
      await this._connection.db?.command({ ping: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}
