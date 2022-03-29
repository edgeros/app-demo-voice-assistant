import { EdgerPermissionResult } from '@edgeros/web-sdk';
import { IUser } from './auth.interface';

export interface IStoreState {
  srand: string;
  token: string;
  accountInfo: IUser; // 当前登录账号信息
  safeAreaData: ISafeAreaData | null;
  transitionName: 'slide-left' | 'slide-right';
  permissions: EdgerPermissionResult | null
}

export interface ISafeAreaData {
  top: number;
  left: number;
  right: number;
  bottom: number;
}
