import { DeviceInfo } from '../types';

export interface IHttpHelperService {
  getClientDeviceInfo(): DeviceInfo;
}
