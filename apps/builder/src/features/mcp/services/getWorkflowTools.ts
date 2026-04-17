import prisma from '@typebot.io/lib/prisma'
import logger from '@/helpers/logger'
import type { GetWorkflowToolsResult } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

interface GetWorkflowToolsParams {
  tenant: string
  /**
   * When true, include draft (unpublished) typebots in the result set.
   * Each tool's `isPublished` field still reflects its true state so the
   * caller can mark drafts in the UI. Defaults to false so agents keep
   * receiving only published tools — drafts would fail at runtime anyway
   * because `executeWorkflow` requires a public flow.
   *
   * The claudia-app Tools page sets this to true so users can see the
   * tools they've created but haven't published yet, with a warning
   * badge. The agents path (claudia supervisor → MCP) leaves it false.
   */
  includeDrafts?: boolean
}

/**
 * Retrieve all TOOL-type typebots for a given tenant.
 * Extracts variable definitions from Declare Variables blocks.
 *
 * By default only published typebots are returned. Pass `includeDrafts:
 * true` to include drafts as well — useful for UIs that want to show
 * unpublished work-in-progress tools.
 */
export async function getWorkflowTools({
  tenant,
  includeDrafts = false,
}: GetWorkflowToolsParams): Promise<GetWorkflowToolsResult> {
  logger.debug('getWorkflowTools: querying typebots', { tenant, includeDrafts })
  const typebots = await prisma.typebot.findMany({
    where: {
      tenant,
      isArchived: { not: true },
      toolDescription: { not: null },
      // Filter out drafts by default. The `isPublished` field on each
      // returned tool always reflects reality, so opting into drafts is
      // a one-line flag flip on the caller's side.
      ...(includeDrafts ? {} : { publishedTypebot: { isNot: null } }),
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
      createdAt: true,
      updatedAt: true,
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
        createdAt: typebot.createdAt,
        updatedAt: typebot.updatedAt,
      }
    })

  logger.debug('getWorkflowTools: completed', {
    tenant,
    totalTypebots: typebots.length,
    filteredTools: tools.length,
  })

  return { tools }
}
