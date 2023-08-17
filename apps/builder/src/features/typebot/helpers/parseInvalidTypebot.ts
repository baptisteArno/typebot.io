import { Edge, PublicTypebot, Typebot, edgeSchema } from '@typebot.io/schemas'

export const parseInvalidTypebot = (
  typebot: Typebot | PublicTypebot
): Typebot | PublicTypebot => ({
  ...typebot,
  version: typebot.version as null | '3' | '4' | '5',
  edges: parseInvalidEdges(typebot.edges),
})

const parseInvalidEdges = (edges: Edge[]) =>
  edges?.filter((edge) => edgeSchema.safeParse(edge).success)
