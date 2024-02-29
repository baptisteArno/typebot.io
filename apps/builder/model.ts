/**
 * Model Account
 *
 */
export type Account = {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  oauth_token_secret: string | null
  oauth_token: string | null
  refresh_token_expires_in: number | null
}

/**
 * Model Session
 *
 */
export type Session = {
  id: string
  sessionToken: string
  userId: string
  expires: Date
}

/**
 * Model User
 *
 */
export type User = {
  id: string
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  apiToken: string | null
  company: string | null
  onboardingCategories: string[]
  graphNavigation: GraphNavigation | null
}

/**
 * Model Workspace
 *
 */
export type Workspace = {
  id: string
  name: string
  icon: string | null
  createdAt: Date
  plan: Plan
  stripeId: string | null
  channel?: string
}

/**
 * Model MemberInWorkspace
 *
 */
export type MemberInWorkspace = {
  userId: string
  workspaceId: string
  role: WorkspaceRole
}

/**
 * Model WorkspaceInvitation
 *
 */
export type WorkspaceInvitation = {
  id: string
  createdAt: Date
  email: string
  workspaceId: string
  type: WorkspaceRole
}

/**
 * Model CustomDomain
 *
 */
export type CustomDomain = {
  name: string
  createdAt: Date
  workspaceId: string | null
}

/**
 * Model Credentials
 *
 */
export type Credentials = {
  id: string
  createdAt: Date
  workspaceId: string | null
  data: string
  name: string
  type: string
  iv: string
}

/**
 * Model VerificationToken
 *
 */
export type VerificationToken = {
  identifier: string
  token: string
  expires: Date
}

/**
 * Model DashboardFolder
 *
 */
export type DashboardFolder = {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  parentFolderId: string | null
  workspaceId: string | null
}

/**
 * Model Typebot
 *
 */
export type Typebot = {
  id: string
  createdAt: Date
  createdBy: string
  updatedAt: Date | null
  updatedBy: string | null
  deletedAt: Date | null
  deletedBy: string | null
  icon: string | null
  name: string
  publishedTypebotId: string | null
  folderId: string | null
  blocks: []
  variables: []
  edges: []
  theme: {}
  settings: {}
  publicId: string | null
  customDomain: string | null
  subDomain: string
  workspaceId: string | null
  domain: string | null
  availableFor: string[]
}

/**
 * Model Invitation
 *
 */
export type Invitation = {
  createdAt: Date
  email: string
  typebotId: string
  type: CollaborationType
}

/**
 * Model CollaboratorsOnTypebots
 *
 */
export type CollaboratorsOnTypebots = {
  userId: string
  typebotId: string
  type: CollaborationType
}

/**
 * Model PublicTypebot
 *
 */
export type PublicTypebot = {
  id: string
  createdAt: Date
  createdBy: string
  updatedAt: Date | null
  updatedBy: string | null
  deletedAt: Date | null
  deletedBy: string | null
  typebotId: string
  name: string
  blocks: []
  variables: []
  edges: []
  theme: {}
  settings: {}
  publicId: string | null
  customDomain: string | null
}

/**
 * Model Result
 *
 */
export type Result = {
  id: string
  createdAt: Date
  updatedAt: Date
  typebotId: string
  variables: []
  isCompleted: boolean
}

/**
 * Model Log
 *
 */
export type Log = {
  id: string
  createdAt: Date
  resultId: string
  status: string
  description: string
  details: string | null
}

/**
 * Model Answer
 *
 */
export type Answer = {
  createdAt: Date
  resultId: string
  stepId: string
  blockId: string
  variableId: string | null
  content: string
}

/**
 * Model Coupon
 *
 */
export type Coupon = {
  userPropertiesToUpdate: {}
  code: string
  dateRedeemed: Date | null
}

/**
 * Model Webhook
 *
 */
export type Webhook = {
  id: string
  url: string | null
  method: string
  queryParams: []
  headers: []
  body: string | null
  typebotId: string
}

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const GraphNavigation = {
  MOUSE: 'MOUSE',
  TRACKPAD: 'TRACKPAD',
}

export type GraphNavigation =
  typeof GraphNavigation[keyof typeof GraphNavigation]

export const Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  TEAM: 'TEAM',
  LIFETIME: 'LIFETIME',
  OFFERED: 'OFFERED',
}

export type Plan = typeof Plan[keyof typeof Plan]

export const WorkspaceRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
}

export type WorkspaceRole = typeof WorkspaceRole[keyof typeof WorkspaceRole]

export const CollaborationType = {
  READ: 'READ',
  WRITE: 'WRITE',
  FULL_ACCESS: 'FULL_ACCESS',
}

export type FeatureFlagsProps = {
  code: string
  active: boolean
  baseLimit: number | null
  qty: number | null
  maxLimit: number | null
}

export type FeatureFlags = {
  'new-billing': FeatureFlagsProps
  'whatsapp-api': FeatureFlagsProps
  'whatsapp-api-pkg-msg-single-250': FeatureFlagsProps
  user: FeatureFlagsProps
  botwebhook: FeatureFlagsProps
  botconditional: FeatureFlagsProps
  chatbot: FeatureFlagsProps
  whatsapp: FeatureFlagsProps
  messenger: FeatureFlagsProps
  instagram: FeatureFlagsProps
  widget: FeatureFlagsProps
  email: FeatureFlagsProps
  office_hours: FeatureFlagsProps
  contact_custom_fields: FeatureFlagsProps
  service_groups: FeatureFlagsProps
  unassigned_list: FeatureFlagsProps
  mensagens_prontas: FeatureFlagsProps
  service_roulette: FeatureFlagsProps
  service_transfer: FeatureFlagsProps
  custom_reports: FeatureFlagsProps
  reports_export: FeatureFlagsProps
  service_survey: FeatureFlagsProps
  'new-octa-ticket': FeatureFlagsProps
  'inbox-bot-disabled': FeatureFlagsProps
  'commerce-enabled': FeatureFlagsProps
  'use-new-bot-builder': FeatureFlagsProps
  'responsible-contact-enabled': FeatureFlagsProps
}

export type CollaborationType =
  typeof CollaborationType[keyof typeof CollaborationType]
