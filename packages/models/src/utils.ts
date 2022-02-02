export type Table<T> = { byId: { [key: string]: T }; allIds: string[] }

export const defaultTable = { byId: {}, allIds: [] }
