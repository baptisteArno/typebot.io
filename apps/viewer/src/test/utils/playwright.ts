import path from 'path'

export const getTestAsset = (name: string) =>
  path.join(__dirname, '..', 'assets', name)
