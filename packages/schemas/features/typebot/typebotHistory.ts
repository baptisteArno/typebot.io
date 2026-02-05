import { TypebotHistoryOrigin } from '@typebot.io/prisma'
import { z } from '../../zod'
import { EventType } from '../events/constants'
import { startEventSchema } from '../events/start/schema'
import { edgeSchema } from './edge'
import { groupV6Schema } from './group'
import { TypebotV6 } from './typebot'
import { variableSchema } from './variable'
import {
  TypebotHistory as PrismaTypebotHistory,
  Typebot,
} from '@typebot.io/prisma'
import { themeSchema } from './theme'
import { settingsSchema } from './settings'
import { resultsTablePreferencesSchema } from './typebot'

export const typebotHistoryContentSchema = z.object({
  name: z.string(),
  icon: z.string().nullable(),
  groups: z.array(groupV6Schema).nullable(),
  events: z.array(startEventSchema).nullable(),
  variables: z.array(variableSchema).nullable(),
  edges: z.array(edgeSchema).nullable(),
  theme: themeSchema.nullable(),
  settings: settingsSchema.nullable(),
  folderId: z.string().nullable(),
  selectedThemeTemplateId: z.string().nullable(),
  resultsTablePreferences: resultsTablePreferencesSchema.nullable(),
  publicId: z.string().nullable(),
  customDomain: z.string().nullable(),
  workspaceId: z.string(),
  isArchived: z.boolean().optional(),
  isClosed: z.boolean().optional(),
  isSecondaryFlow: z.boolean().optional().default(false),
  riskLevel: z.number().nullable(),
  whatsAppCredentialsId: z.string().nullable(),
  tenant: z.string().nullable(),
  toolDescription: z.string().nullable(),
})

export type TypebotHistoryContent = z.infer<typeof typebotHistoryContentSchema>

export const typebotHistorySchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  version: z.string(),
  origin: z.nativeEnum(TypebotHistoryOrigin),
  author: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string().nullable(),
      image: z.string().nullable(),
    })
    .nullable(),
  restoredFromId: z.string().nullable(),
  publishedAt: z.coerce.date().nullable(),
  isRestored: z.boolean(),
  content: typebotHistoryContentSchema.optional(),
})

export type TypebotHistory = z.infer<typeof typebotHistorySchema>

export const typebotHistoryResponseSchema = z.object({
  history: z.array(typebotHistorySchema),
  nextCursor: z.string().nullable(),
  totalCount: z.number(),
  oldestDate: z.coerce.date().nullable(),
  newestDate: z.coerce.date().nullable(),
})

export type TypebotHistoryResponse = z.infer<
  typeof typebotHistoryResponseSchema
>

export const parsePrismaTypebotHistory = (
  prismaHistory: PrismaTypebotHistory & {
    author?: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    } | null
  }
): TypebotHistory => {
  const content: TypebotHistoryContent = {
    name: prismaHistory.name,
    icon: prismaHistory.icon,
    groups: prismaHistory.groups as z.infer<typeof groupV6Schema>[] | null,
    events: prismaHistory.events as z.infer<typeof startEventSchema>[] | null,
    variables: prismaHistory.variables as
      | z.infer<typeof variableSchema>[]
      | null,
    edges: prismaHistory.edges as z.infer<typeof edgeSchema>[] | null,
    theme: prismaHistory.theme as z.infer<typeof themeSchema> | null,
    settings: prismaHistory.settings as z.infer<typeof settingsSchema> | {},
    folderId: prismaHistory.folderId,
    selectedThemeTemplateId: prismaHistory.selectedThemeTemplateId,
    resultsTablePreferences: prismaHistory.resultsTablePreferences as z.infer<
      typeof resultsTablePreferencesSchema
    > | null,
    publicId: prismaHistory.publicId,
    customDomain: prismaHistory.customDomain,
    workspaceId: prismaHistory.workspaceId,
    isArchived: prismaHistory.isArchived,
    isClosed: prismaHistory.isClosed,
    isSecondaryFlow: prismaHistory.isSecondaryFlow,
    riskLevel: prismaHistory.riskLevel,
    whatsAppCredentialsId: prismaHistory.whatsAppCredentialsId,
    tenant: prismaHistory.tenant,
    toolDescription: prismaHistory.toolDescription,
  }

  return {
    id: prismaHistory.id,
    createdAt: prismaHistory.createdAt,
    version: prismaHistory.version || '6',
    origin: prismaHistory.origin as TypebotHistory['origin'],
    author: prismaHistory.author || {
      id: prismaHistory.authorId || '',
      name: null,
      email: null,
      image: null,
    },
    restoredFromId: prismaHistory.restoredFromId,
    publishedAt: prismaHistory.publishedAt,
    isRestored: prismaHistory.isRestored,
    content,
  }
}

export const parseTypebotHistory = (
  history: TypebotHistoryContent
): Omit<TypebotV6, 'id' | 'createdAt' | 'updatedAt'> => {
  const events: [z.infer<typeof startEventSchema>] =
    history.events && history.events.length > 0
      ? [history.events[0]]
      : [
          {
            type: EventType.START,
            id: generateId(),
            graphCoordinates: { x: 0, y: 0 },
          },
        ]

  return {
    version: '6' as const,
    name: history.name,
    icon: history.icon,
    groups: history.groups || [],
    events,
    variables: history.variables || [],
    edges: history.edges || [],
    theme: history.theme || {},
    settings: history.settings || {},
    folderId: history.folderId || null,
    selectedThemeTemplateId: history.selectedThemeTemplateId || null,
    resultsTablePreferences: null,
    publicId: null,
    customDomain: null,
    workspaceId: history.workspaceId,
    isArchived: false,
    isClosed: false,
    isSecondaryFlow: history.isSecondaryFlow || false,
    riskLevel: null,
    whatsAppCredentialsId: history.whatsAppCredentialsId || null,
    tenant: history.tenant || null,
    toolDescription: history.toolDescription || null,
  }
}

export const createTypebotHistoryContent = (
  typebot: TypebotV6
): TypebotHistoryContent => {
  return {
    name: typebot.name,
    icon: typebot.icon,
    groups: typebot.groups,
    events: typebot.events,
    variables: typebot.variables,
    edges: typebot.edges,
    theme: typebot.theme,
    settings: typebot.settings,
    folderId: typebot.folderId,
    selectedThemeTemplateId: typebot.selectedThemeTemplateId,
    resultsTablePreferences: typebot.resultsTablePreferences,
    publicId: typebot.publicId,
    customDomain: typebot.customDomain,
    workspaceId: typebot.workspaceId,
    isArchived: typebot.isArchived,
    isClosed: typebot.isClosed,
    isSecondaryFlow: typebot.isSecondaryFlow || false,
    riskLevel: typebot.riskLevel,
    whatsAppCredentialsId: typebot.whatsAppCredentialsId,
    tenant: typebot.tenant ?? null,
    toolDescription: typebot.toolDescription ?? null,
  }
}

export const convertTypebotHistoryToTypebot = (
  historySnapshot: PrismaTypebotHistory
): Typebot => {
  return {
    id: historySnapshot.id,
    version: historySnapshot.version,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: historySnapshot.name,
    icon: historySnapshot.icon,
    folderId: historySnapshot.folderId,
    groups: historySnapshot.groups,
    events: historySnapshot.events,
    variables: historySnapshot.variables,
    edges: historySnapshot.edges,
    theme: historySnapshot.theme,
    selectedThemeTemplateId: historySnapshot.selectedThemeTemplateId,
    settings: historySnapshot.settings,
    resultsTablePreferences: historySnapshot.resultsTablePreferences,
    publicId: historySnapshot.publicId,
    customDomain: historySnapshot.customDomain,
    workspaceId: historySnapshot.workspaceId,
    isArchived: historySnapshot.isArchived,
    isClosed: historySnapshot.isClosed,
    isSecondaryFlow: historySnapshot.isSecondaryFlow || false,
    riskLevel: historySnapshot.riskLevel,
    whatsAppCredentialsId: historySnapshot.whatsAppCredentialsId,
    tenant: historySnapshot.tenant,
    toolDescription: historySnapshot.toolDescription,
  }
}

const generateId = (): string => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `${timestamp}_${randomPart}`
}
