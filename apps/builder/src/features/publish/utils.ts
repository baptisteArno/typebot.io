import { createId } from '@paralleldrive/cuid2'
import { PublicTypebot, Typebot } from 'models'
import { dequal } from 'dequal'
import { omit } from 'utils'
import { diff } from 'deep-object-diff'
import { toKebabCase } from '@/utils/helpers'

export const parsePublicTypebotToTypebot = (
  typebot: PublicTypebot,
  existingTypebot: Typebot
): Typebot => ({
  id: typebot.typebotId,
  version: typebot.version,
  groups: typebot.groups,
  edges: typebot.edges,
  name: existingTypebot.name,
  publicId: existingTypebot.publicId,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  customDomain: existingTypebot.customDomain,
  createdAt: existingTypebot.createdAt,
  updatedAt: existingTypebot.updatedAt,
  folderId: existingTypebot.folderId,
  icon: existingTypebot.icon,
  workspaceId: existingTypebot.workspaceId,
  isArchived: existingTypebot.isArchived,
  isClosed: existingTypebot.isClosed,
  resultsTablePreferences: existingTypebot.resultsTablePreferences,
})

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: createId(),
  version: typebot.version,
  typebotId: typebot.id,
  groups: typebot.groups,
  edges: typebot.edges,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const checkIfTypebotsAreEqual = (typebotA: Typebot, typebotB: Typebot) =>
  dequal(
    JSON.parse(JSON.stringify(omit(typebotA, 'updatedAt'))),
    JSON.parse(JSON.stringify(omit(typebotB, 'updatedAt')))
  )

export const checkIfPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean
) => {
  if (debug)
    console.log(
      diff(
        JSON.parse(JSON.stringify(typebot.groups)),
        JSON.parse(JSON.stringify(publicTypebot.groups))
      )
    )
  return (
    dequal(
      JSON.parse(JSON.stringify(typebot.groups)),
      JSON.parse(JSON.stringify(publicTypebot.groups))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.settings)),
      JSON.parse(JSON.stringify(publicTypebot.settings))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.theme)),
      JSON.parse(JSON.stringify(publicTypebot.theme))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.variables)),
      JSON.parse(JSON.stringify(publicTypebot.variables))
    )
  )
}

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(name) + `-${id?.slice(-7)}`
