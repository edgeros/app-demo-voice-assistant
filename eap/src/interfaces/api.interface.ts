import { IUser } from './common.interface';

export interface ICreateRoomData {
  name: string;
  creator: IUser;
}

export interface IResponse {
  result: boolean;
  message: string;
  data?: any;
}

export type ICallBack = (res: IResponse) => void;