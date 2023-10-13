export interface ITagsServices {
  getAll(): Promise<Array<Tag>>
}

export type Tag = {
  _id: string,
  name: string;
}