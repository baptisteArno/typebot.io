import { toKebabCase } from '@/helpers/toKebabCase'

export const parseDefaultPublicId = (name: string, id: string) => {
  const prefix = toKebabCase(name)
  return `${prefix !== '' ? `${prefix}-` : ''}${id?.slice(-7)}`
}
