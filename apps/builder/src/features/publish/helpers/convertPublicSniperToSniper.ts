import { PublicSniper, SniperV6 } from '@sniper.io/schemas'

export const convertPublicSniperToSniper = (
  sniper: PublicSniper,
  existingSniper: SniperV6
): SniperV6 => {
  if (sniper.version !== '6') return existingSniper
  return {
    id: sniper.sniperId,
    version: sniper.version,
    groups: sniper.groups,
    edges: sniper.edges,
    name: existingSniper.name,
    publicId: existingSniper.publicId,
    settings: sniper.settings,
    theme: sniper.theme,
    variables: sniper.variables,
    customDomain: existingSniper.customDomain,
    createdAt: existingSniper.createdAt,
    updatedAt: existingSniper.updatedAt,
    folderId: existingSniper.folderId,
    icon: existingSniper.icon,
    workspaceId: existingSniper.workspaceId,
    isArchived: existingSniper.isArchived,
    isClosed: existingSniper.isClosed,
    resultsTablePreferences: existingSniper.resultsTablePreferences,
    selectedThemeTemplateId: existingSniper.selectedThemeTemplateId,
    whatsAppCredentialsId: existingSniper.whatsAppCredentialsId,
    riskLevel: existingSniper.riskLevel,
    events: sniper.events,
  }
}
