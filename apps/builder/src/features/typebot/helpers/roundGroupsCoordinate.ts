import { Typebot } from '@typebot.io/schemas'

export const roundGroupsCoordinate = (typebot: Typebot): Typebot => {
  const groups = typebot.groups.map((group) => {
    const { x, y } = group.graphCoordinates
    return {
      ...group,
      graphCoordinates: { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) },
    }
  })
  return { ...typebot, groups }
}
