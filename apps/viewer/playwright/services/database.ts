import {
  CredentialsType,
  defaultSettings,
  defaultTheme,
  PublicTypebot,
  SmtpCredentialsData,
  Step,
  Typebot,
  Webhook,
} from 'models'
//import { PrismaClient, WorkspaceRole } from 'db'
import { readFileSync } from 'fs'
import { encrypt } from 'utils'

//const prisma = new PrismaClient()

const proWorkspaceId = 'proWorkspaceViewer'

export const teardownDatabase = async () => {
  // try {
  //   await prisma.workspace.deleteMany({
  //     where: { members: { some: { userId: { in: ['proUser'] } } } },
  //   })
  //   await prisma.user.deleteMany({
  //     where: { id: { in: ['proUser'] } },
  //   })
  // } catch (err) {
  //   console.error(err)
  // }
  return
}

export const setupDatabase = () => createUser()

export const createUser = () =>
{
  // prisma.user.create({
  //   data: {
  //     id: 'proUser',
  //     email: 'user@email.com',
  //     name: 'User',
  //     apiToken: 'userToken',
  //     workspaces: {
  //       create: {
  //         role: WorkspaceRole.ADMIN,
  //         workspace: {
  //           create: {
  //             id: proWorkspaceId,
  //             name: 'Pro workspace',
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  return 
}
export const createWebhook = (typebotId: string, webhook?: Partial<Webhook>) => {
  // prisma.webhook.create({
  //   data: {
  //     id: 'webhook1',
  //     typebotId,
  //     method: 'GET',
  //     ...webhook,
  //   },
  // })
  return
}

export const createTypebots = async (partialTypebots: Partial<Typebot>[]) => {
  // await prisma.typebot.createMany({
  //   data: partialTypebots.map(parseTestTypebot) as any[],
  // })
  // return prisma.publicTypebot.createMany({
  //   data: partialTypebots.map((t) =>
  //     parseTypebotToPublicTypebot(t.id + '-published', parseTestTypebot(t))
  //   ) as any[],
  // })

  return
}

export const updateTypebot = async (
  partialTypebot: Partial<Typebot> & { id: string }
) => {
  // await prisma.typebot.updateMany({
  //   where: { id: partialTypebot.id },
  //   data: partialTypebot,
  // })
  // return prisma.publicTypebot.updateMany({
  //   where: { typebotId: partialTypebot.id },
  //   data: partialTypebot,
  // })

  return
}

const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot
): PublicTypebot => ({
  id,
  name: typebot.name,
  blocks: typebot.blocks,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
  variables: typebot.variables,
  edges: typebot.edges,
  customDomain: null,
  createdAt: typebot.createdAt,
  updatedAt: typebot.updatedAt,
  deletedAt: null,
  createdBy: '',
  deletedBy: '',
  updatedBy: ''
})

const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => ({
  id: partialTypebot.id ?? 'typebot',
  folderId: null,
  name: 'My typebot',
  workspaceId: proWorkspaceId,
  icon: null,
  theme: defaultTheme,
  settings: defaultSettings,
  publicId: partialTypebot.id + '-public',
  publishedTypebotId: null,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  deletedAt: null,
  createdBy: '',
  deletedBy: '',
  updatedBy: '',
  customDomain: null,
  variables: [],
  ...partialTypebot,
  edges: [
    {
      id: 'edge1',
      from: { blockId: 'block0', stepId: 'step0' },
      to: { blockId: 'block1' },
    },
  ],
  blocks: [
    {
      id: 'block0',
      title: 'Block #0',
      steps: [
        {
          id: 'step0',
          type: 'start',
          blockId: 'block0',
          label: 'Start',
          outgoingEdgeId: 'edge1',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    ...(partialTypebot.blocks ?? []),
  ],
  subDomain: partialTypebot.subDomain || ''
})

export const parseDefaultBlockWithStep = (
  step: Partial<Step>
): Pick<Typebot, 'blocks'> => ({
  blocks: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'block1',
      steps: [
        {
          id: 'step1',
          blockId: 'block1',
          ...step,
        } as Step,
      ],
      title: 'Block #1',
    },
  ],
})

export const importTypebotInDatabase = async (
  path: string,
  updates?: Partial<Typebot>
) => {
  // const typebot: Typebot = {
  //   ...JSON.parse(readFileSync(path).toString()),
  //   ...updates,
  //   workspaceId: proWorkspaceId,
  // }
  // await prisma.typebot.create({
  //   data: typebot,
  // })
  // return prisma.publicTypebot.create({
  //   data: parseTypebotToPublicTypebot(
  //     updates?.id ? `${updates?.id}-public` : 'publicBot',
  //     typebot
  //   ),
  // })
  return
}

export const createResults = async ({ typebotId }: { typebotId: string }) => {
  // await prisma.result.deleteMany()
  // await prisma.result.createMany({
  //   data: [
  //     ...Array.from(Array(200)).map((_, idx) => {
  //       const today = new Date()
  //       const rand = Math.random()
  //       return {
  //         id: `result${idx}`,
  //         typebotId,
  //         createdAt: new Date(
  //           today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
  //         ),
  //         isCompleted: rand > 0.5,
  //       }
  //     }),
  //   ],
  // })
  return createAnswers()
}

const createAnswers = () => {
  // return prisma.answer.createMany({
  //   data: [
  //     ...Array.from(Array(200)).map((_, idx) => ({
  //       resultId: `result${idx}`,
  //       content: `content${idx}`,
  //       stepId: 'step1',
  //       blockId: 'block1',
  //     })),
  //   ],
  // })

  return
}

export const createSmtpCredentials = (
  id: string,
  smtpData: SmtpCredentialsData
) => {
  //const { encryptedData, iv } = encrypt(smtpData)
  // return prisma.credentials.create({
  //   data: {
  //     id,
  //     data: encryptedData,
  //     iv,
  //     name: smtpData.from.email as string,
  //     type: CredentialsType.SMTP,
  //     workspaceId: proWorkspaceId,
  //   },
  // })

  return
}
