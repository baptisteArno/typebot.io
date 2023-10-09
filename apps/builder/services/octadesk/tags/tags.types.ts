export interface ITagsServices {
  getAll(): Promise<Array<Tag>>
}

export type Tag = {
  id: string,
  name: string;
}