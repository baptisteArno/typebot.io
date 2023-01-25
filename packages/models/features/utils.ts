import { z } from 'zod'

export type IdMap<T> = { [id: string]: T }

export const schemaForType =
  <T>() =>
  <S extends z.ZodType<T, any, any>>(arg: S) => {
    return arg
  }
