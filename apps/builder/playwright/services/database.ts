import {
  CredentialsType,
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  Block,
  Typebot,
  Webhook,
} from 'models'
import {
  CollaborationType,
  DashboardFolder,
  GraphNavigation,
  Plan,
  PrismaClient,
  User,
  WorkspaceRole,
  Workspace,
} from 'db'
import { readFileSync } from 'fs'
import { injectFakeResults } from 'utils'
import { encrypt } from 'utils/api'
import Stripe from 'stripe'
import cuid from 'cuid'

const prisma = new PrismaClient()

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY ?? '', {
  apiVersion: '2022-08-01',
})

export const userId = 'userId'
const otherUserId = 'otherUserId'
export const freeWorkspaceId = 'freeWorkspace'
export const starterWorkspaceId = 'starterWorkspace'
export const proWorkspaceId = 'proWorkspace'
const lifetimeWorkspaceId = 'lifetimeWorkspaceId'

export const teardownDatabase = async () => {
  await prisma.workspace.deleteMany({
    where: {
      members: {
        some: { userId: { in: [userId, otherUserId] } },
      },
    },
  })
  await prisma.user.deleteMany({
    where: { id: { in: [userId, otherUserId] } },
  })
  return prisma.webhook.deleteMany()
}

export const deleteWorkspaces = async (workspaceIds: string[]) => {
  await prisma.workspace.deleteMany({
    where: { id: { in: workspaceIds } },
  })
}

export const addSubscriptionToWorkspace = async (
  workspaceId: string,
  items: Stripe.SubscriptionCreateParams.Item[],
  metadata: Pick<
    Workspace,
    'additionalChatsIndex' | 'additionalStorageIndex' | 'plan'
  >
) => {
  const { id: stripeId } = await stripe.customers.create({
    email: 'test-user@gmail.com',
    name: 'Test User',
  })
  const { id: paymentId } = await stripe.paymentMethods.create({
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2022,
      cvc: '123',
    },
    type: 'card',
  })
  await stripe.paymentMethods.attach(paymentId, { customer: stripeId })
  await stripe.subscriptions.create({
    customer: stripeId,
    items,
    default_payment_method: paymentId,
    currency: 'eur',
  })
  await stripe.customers.update(stripeId, {
    invoice_settings: { default_payment_method: paymentId },
  })
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      stripeId,
      ...metadata,
    },
  })
}

export const setupDatabase = async () => {
  await setupWorkspaces()
  await setupUsers()
  return setupCredentials()
}

export const setupWorkspaces = async () =>
  prisma.workspace.createMany({
    data: [
      {
        id: freeWorkspaceId,
        name: 'Free workspace',
        plan: Plan.FREE,
      },
      {
        id: starterWorkspaceId,
        name: 'Starter workspace',
        stripeId: 'cus_LnPDugJfa18N41',
        plan: Plan.STARTER,
      },
      {
        id: proWorkspaceId,
        name: 'Pro workspace',
        plan: Plan.PRO,
      },
      {
        id: lifetimeWorkspaceId,
        name: 'Lifetime workspace',
        plan: Plan.LIFETIME,
      },
    ],
  })

export const createWorkspaces = async (workspaces: Partial<Workspace>[]) => {
  const workspaceIds = workspaces.map((workspace) => workspace.id ?? cuid())
  await prisma.workspace.createMany({
    data: workspaces.map((workspace, index) => ({
      id: workspaceIds[index],
      name: 'Free workspace',
      plan: Plan.FREE,
      ...workspace,
    })),
  })
  await prisma.memberInWorkspace.createMany({
    data: workspaces.map((_, index) => ({
      userId,
      workspaceId: workspaceIds[index],
      role: WorkspaceRole.ADMIN,
    })),
  })
  return workspaceIds
}

export const setupUsers = async () => {
  await prisma.user.create({
    data: {
      id: userId,
      email: 'user@email.com',
      name: 'John Doe',
      graphNavigation: GraphNavigation.TRACKPAD,
      apiTokens: {
        createMany: {
          data: [
            {
              name: 'Token 1',
              token: 'jirowjgrwGREHEtoken1',
              createdAt: new Date(2022, 1, 1),
            },
            {
              name: 'Github',
              token: 'jirowjgrwGREHEgdrgithub',
              createdAt: new Date(2022, 1, 2),
            },
            {
              name: 'N8n',
              token: 'jirowjgrwGREHrgwhrwn8n',
              createdAt: new Date(2022, 1, 3),
            },
          ],
        },
      },
    },
  })
  await prisma.user.create({
    data: { id: otherUserId, email: 'other-user@email.com', name: 'James Doe' },
  })
  return prisma.memberInWorkspace.createMany({
    data: [
      {
        role: WorkspaceRole.ADMIN,
        userId,
        workspaceId: freeWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId,
        workspaceId: starterWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId,
        workspaceId: proWorkspaceId,
      },
      {
        role: WorkspaceRole.ADMIN,
        userId,
        workspaceId: lifetimeWorkspaceId,
      },
    ],
  })
}

export const createWebhook = async (
  typebotId: string,
  webhookProps?: Partial<Webhook>
) => {
  try {
    await prisma.webhook.delete({ where: { id: 'webhook1' } })
  } catch {}
  return prisma.webhook.create({
    data: { method: 'GET', typebotId, id: 'webhook1', ...webhookProps },
  })
}

export const createCollaboration = (
  userId: string,
  typebotId: string,
  type: CollaborationType
) =>
  prisma.collaboratorsOnTypebots.create({ data: { userId, typebotId, type } })

export const getSignedInUser = (email: string) =>
  prisma.user.findFirst({ where: { email } })

export const createTypebots = async (partialTypebots: Partial<Typebot>[]) => {
  await prisma.typebot.createMany({
    data: partialTypebots.map(parseTestTypebot),
  })
  return prisma.publicTypebot.createMany({
    data: partialTypebots.map((t) =>
      parseTypebotToPublicTypebot(t.id + '-public', parseTestTypebot(t))
    ),
  })
}

export const createFolders = (partialFolders: Partial<DashboardFolder>[]) =>
  prisma.dashboardFolder.createMany({
    data: partialFolders.map((folder) => ({
      workspaceId: proWorkspaceId,
      name: 'Folder #1',
      ...folder,
    })),
  })

const setupCredentials = () => {
  const { encryptedData, iv } = encrypt({
    expiry_date: 1642441058842,
    access_token:
      'ya29.A0ARrdaM--PV_87ebjywDJpXKb77NBFJl16meVUapYdfNv6W6ZzqqC47fNaPaRjbDbOIIcp6f49cMaX5ndK9TAFnKwlVqz3nrK9nLKqgyDIhYsIq47smcAIZkK56SWPx3X3DwAFqRu2UPojpd2upWwo-3uJrod',
    // This token is linked to a test Google account (typebot.test.user@gmail.com)
    refresh_token:
      '1//039xWRt8YaYa3CgYIARAAGAMSNwF-L9Iru9FyuTrDSa7lkSceggPho83kJt2J29G69iEhT1C6XV1vmo6bQS9puL_R2t8FIwR3gek',
  })
  return prisma.credentials.createMany({
    data: [
      {
        name: 'pro-user@email.com',
        type: CredentialsType.GOOGLE_SHEETS,
        data: encryptedData,
        workspaceId: proWorkspaceId,
        iv,
      },
    ],
  })
}

export const updateUser = (data: Partial<User>) =>
  prisma.user.update({
    data,
    where: {
      id: userId,
    },
  })

export const createResults = injectFakeResults(prisma)

export const createFolder = (workspaceId: string, name: string) =>
  prisma.dashboardFolder.create({
    data: {
      workspaceId,
      name,
    },
  })

const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): Omit<PublicTypebot, 'createdAt' | 'updatedAt'> => ({
  id,
  groups: typebot.groups,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  variables: typebot.variables,
  edges: typebot.edges,
})

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  workspaceId: proWorkspaceId,
  folderId: null,
  name: 'My typebot',
  theme: defaultTheme,
  settings: defaultSettings,
  publicId: null,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  publishedTypebotId: null,
  customDomain: null,
  icon: null,
  variables: [{ id: 'var1', name: 'var1' }],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { groupId: 'block0', blockId: 'block0' },
      to: { groupId: 'block1' },
    },
  ],
  groups: [
    {
      id: 'block0',
      title: 'Group #0',
      blocks: [
        {
          id: 'block0',
          type: 'start',
          groupId: 'block0',
          label: 'Start',
          outgoingEdgeId: 'edge1',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    ...(partialTypebot.groups ?? []),
  ],
})

export const parseDefaultGroupWithBlock = (
  block: Partial<Block>
): Pick<Typebot, 'groups'> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'block1',
      blocks: [
        {
          id: 'block1',
          groupId: 'block1',
          ...block,
        } as Block,
      ],
      title: 'Group #1',
    },
  ],
})

export const importTypebotInDatabase = async (
  path: string,
  updates?: Partial<Typebot>
) => {
  const typebot: Typebot = {
    ...JSON.parse(readFileSync(path).toString()),
    workspaceId: proWorkspaceId,
    ...updates,
  }
  await prisma.typebot.create({
    data: typebot,
  })
  return prisma.publicTypebot.create({
    data: parseTypebotToPublicTypebot(
      updates?.id ? `${updates?.id}-public` : 'publicBot',
      typebot
    ),
  })
}
