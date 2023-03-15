import { omit } from '@typebot.io/lib'

export const removeTypebotOldProperties = (data: unknown) => {
  if (!data || typeof data !== 'object') return data
  if ('publishedTypebotId' in data) {
    return omit(data, 'publishedTypebotId')
  }
  return data
}
