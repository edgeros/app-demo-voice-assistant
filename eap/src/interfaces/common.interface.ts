export interface IKeyValue {
  [prop: string]: string | boolean | number | undefined | null | IKeyValue | IKeyValue[];
}

export interface IUser {
  acoid: string;
  nickname: string;
  profile: string;
}
