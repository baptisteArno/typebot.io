import { User } from 'db'
import { LogicStepType, Typebot, TypebotLinkStep, PublicTypebot } from 'models'
import { NextApiRequest } from 'next'
import { isDefined } from 'utils'
import { canReadTypebots } from './dbRules'

export const authenticateUser = async (
  req: NextApiRequest
): Promise<User | undefined> => authenticateByToken(extractBearerToken(req))

const authenticateByToken = async (
  apiToken?: string
): Promise<User | undefined> => {
  if (!apiToken) return
  return 
  //(await prisma.user.findFirst({ where: { apiToken } })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)

export const saveErrorLog = (
  resultId: string | undefined,
  message: string,
  details?: any
) => saveLog('error', resultId, message, details)

export const saveSuccessLog = (
  resultId: string | undefined,
  message: string,
  details?: any
) => saveLog('success', resultId, message, details)

const saveLog = (
  status: 'error' | 'success',
  resultId: string | undefined,
  message: string,
  details?: any
) => {
  if (!resultId || resultId === 'undefined') return
  return 
  // prisma.log.create({
  //   data: {
  //     resultId,
  //     status,
  //     description: message,
  //     details: formatDetails(details),
  //   },
  // })
}

const formatDetails = (details: any) => {
  try {
    return JSON.stringify(details, null, 2).substring(0, 1000)
  } catch {
    return details
  }
}

export const getLinkedTypebots = async (
  typebot: Typebot | PublicTypebot,
  user?: User
): Promise<(Typebot | PublicTypebot)[]> => {
  const linkedTypebotIds = (
    typebot.blocks
      .flatMap((b) => b.steps)
      .filter(
        (s) =>
          s.type === LogicStepType.TYPEBOT_LINK &&
          isDefined(s.options.typebotId)
      ) as TypebotLinkStep[]
  ).map((s) => s.options.typebotId as string)
  if (linkedTypebotIds.length === 0) return []
  //const typebots = 
  // (await ('typebotId' in typebot
  //   ? prisma.publicTypebot.findMany({
  //       where: { id: { in: linkedTypebotIds } },
  //     })
  //   : prisma.typebot.findMany({
  //       where: user
  //         ? {
  //             AND: [
  //               { id: { in: linkedTypebotIds } },
  //               canReadTypebots(linkedTypebotIds, user as User),
  //             ],
  //           }
  //         : { id: { in: linkedTypebotIds } },
  //     }))) as unknown as (Typebot | PublicTypebot)[]
  return []
}
