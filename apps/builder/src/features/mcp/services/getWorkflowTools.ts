import prisma from '@typebot.io/lib/prisma'
import type { GetWorkflowToolsResult } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

interface GetWorkflowToolsParams {
  tenant: string
}

/**
 * Retrieve all published TOOL-type typebots for a given tenant.
 * Extracts variable definitions from Declare Variables blocks.
 */
export async function getWorkflowTools({
  tenant,
}: GetWorkflowToolsParams): Promise<GetWorkflowToolsResult> {
  const typebots = await prisma.typebot.findMany({
    where: {
      tenant,
      isArchived: { not: true },
      toolDescription: { not: null },
      publishedTypebot: { isNot: null },
    },
    select: {
      id: true,
      name: true,
      tenant: true,
      toolDescription: true,
      settings: true,
      variables: true,
      publicId: true,
      groups: true,
      publishedTypebot: {
        select: {
          id: true,
        },
      },
    },
  })

  const tools = typebots
    .filter((typebot) => {
      const settings = typebot.settings as { general?: { type?: string } }
      return (
        settings?.general?.type === 'TOOL' &&
        typebot.tenant &&
        typebot.toolDescription
      )
    })
    .map((typebot) => {
      const typebotVariables = typebot.variables as {
        id: string
        name?: string
        description?: string
      }[]
      const groups = typebot.groups as JsonValue[]
      const declareVariablesBlocks = (groups as { blocks?: JsonValue[] }[])
        .flatMap((g) => g.blocks || [])
        .filter((b) => (b as { type?: string }).type === 'Declare variables')
      const declaredVariables = declareVariablesBlocks.flatMap(
        (b) =>
          (b as { options?: { variables?: JsonValue[] } }).options?.variables ||
          []
      )

      let variables = declaredVariables
        .map((v) => {
          const vObj = v as { variableId?: string; description?: string }
          const variable = typebotVariables.find(
            (tv) => tv.id === vObj.variableId
          )
          return {
            name: variable?.name,
            description: vObj.description,
          }
        })
        .filter((v) => v.name)

      if (variables.length === 0) {
        variables = typebotVariables
          .filter((v) => v.name && v.description)
          .map((v) => ({
            name: v.name,
            description: v.description,
          }))
      }

      const slug = typebot.name
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')

      return {
        id: typebot.id,
        name: typebot.name,
        tenant: typebot.tenant!,
        description: typebot.toolDescription!,
        isPublished: Boolean(typebot.publishedTypebot),
        variables,
        publicName: typebot.publicId ?? `${slug}-${typebot.id.slice(-7)}`,
      }
    })

  return { tools }
}
