/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IKeyValue {
  key: string;
  value: any;
}

export interface IResponse {
  result: boolean,
  message: string,
  data?: any,
}
