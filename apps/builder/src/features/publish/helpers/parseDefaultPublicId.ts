import { toKebabCase } from '@/helpers/toKebabCase'

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(name) + `-${id?.slice(-7)}`
