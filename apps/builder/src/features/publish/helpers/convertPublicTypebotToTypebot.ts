import { PublicTypebot, TypebotV6 } from '@typebot.io/schemas'

export const convertPublicTypebotToTypebot = (
  typebot: PublicTypebot,
  existingTypebot: TypebotV6
): TypebotV6 => {
  if (typebot.version !== '6') return existingTypebot
  return {
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
    selectedThemeTemplateId: existingTypebot.selectedThemeTemplateId,
    whatsAppCredentialsId: existingTypebot.whatsAppCredentialsId,
    riskLevel: existingTypebot.riskLevel,
    events: typebot.events,
  }
}
