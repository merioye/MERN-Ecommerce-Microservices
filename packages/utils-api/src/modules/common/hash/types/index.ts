import { HashAlgorithm } from '../enums';

/**
 * Options to configure the hashing behavior
 * @typedef HashOptions
 */
export type HashOptions = {
  salt?: number;
  algorithm?: HashAlgorithm;
};
