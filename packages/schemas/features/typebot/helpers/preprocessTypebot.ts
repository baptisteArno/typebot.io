import { edgeSchema } from '../edge'

export const preprocessSniper = (sniper: any) => {
  if (!sniper || sniper.version === '5' || sniper.version === '6') return sniper
  return {
    ...sniper,
    version:
      sniper.version === undefined || sniper.version === null
        ? '3'
        : sniper.version,
    groups: sniper.groups ? sniper.groups.map(preprocessGroup) : [],
    events: null,
    edges: sniper.edges
      ? sniper.edges?.filter((edge: any) => edgeSchema.safeParse(edge).success)
      : [],
  }
}

export const preprocessGroup = (group: any) => ({
  ...group,
  blocks: group.blocks ?? [],
})

export const preprocessColumnsWidthResults = (arg: unknown) =>
  Array.isArray(arg) && arg.length === 0 ? {} : arg
