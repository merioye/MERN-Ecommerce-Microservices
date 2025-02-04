import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

import { HashAlgorithm } from '../enums';
import { IHashService } from '../interfaces';
import { HashOptions } from '../types';

/**
 * Service for hashing data using various algorithms
 * @class CryptoHashService
 * @implements {IHashService}
 */
@Injectable()
export class CryptoHashService implements IHashService {
  /**
   * Hashes a string using the specified options
   * @param {string} data - The string to hash
   * @param {HashOptions} [options] - Options for hashing
   * @returns {Promise<string>} The hashed string
   */
  public async hash(data: string, options?: HashOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const hash = createHash(options?.algorithm ?? HashAlgorithm.SHA256)
          .update(data)
          .digest('hex');
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Compares a string with a hashed string
   * @param {string} data - The string to compare
   * @param {string} encrypted - The hashed string to compare with
   * @param {HashOptions} [options] - Options for hashing
   * @returns {Promise<boolean>} True if the strings match, false otherwise
   */
  public async compare(
    data: string,
    encrypted: string,
    options?: HashOptions
  ): Promise<boolean> {
    const dataHash = await this.hash(data, options);
    return dataHash === encrypted;
  }
}
