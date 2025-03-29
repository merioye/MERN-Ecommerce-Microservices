import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { parse } from 'useragent';

import { IHttpHelperService } from '../interfaces';
import { DeviceInfo } from '../types';

/**
 * Service for handling HTTP requests related utils
 * @class HttpHelperService
 * @implements IHttpHelperService
 */
@Injectable({ scope: Scope.REQUEST })
export class HttpHelperService implements IHttpHelperService {
  public constructor(@Inject(REQUEST) private readonly _request: Request) {}

  /**
   * Extracts client device information from request headers
   * @returns {DeviceInfo} - Client device information
   */
  public getClientDeviceInfo(): DeviceInfo {
    // Extract client device info from request headers
    const agent = parse(
      this._request.headers['user-agent'],
      this._request.query.jsuseragent as string
    );
    const ipAddress = this._request.ip || 'unknown';

    const userAgent = agent.family;
    const platform = agent.device.toString() + '/' + agent.os.toString();

    return { userAgent, ipAddress, platform };
  }
}
