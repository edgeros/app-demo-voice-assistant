export interface IAuth {
  token: string;
  srand: string;
}

export interface IHttpQueryAuth {
  "edger-token": string;
  "edger-srand": string;
}

export interface IUser {
  acoid: string;
  nickname: string;
  profile: string;
}
