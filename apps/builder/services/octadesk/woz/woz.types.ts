export interface IWOZServices {
  getAll(): Promise<Array<WOZProfile>>
}

export type WOZProfile = {
  _id: string,
  name: string;
}