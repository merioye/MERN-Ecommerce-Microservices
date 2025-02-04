import { HashOptions } from '../types';

export interface IHashService {
  hash(data: string, options?: HashOptions): Promise<string>;
  compare(
    data: string,
    encrypted: string,
    options?: HashOptions
  ): Promise<boolean>;
}
