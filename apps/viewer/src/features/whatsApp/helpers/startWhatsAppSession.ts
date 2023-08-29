import { startSession } from '@/features/chat/helpers/startSession'
import prisma from '@/lib/prisma'
import {
  ChatReply,
  ComparisonOperators,
  LogicalOperator,
  PublicTypebot,
  SessionState,
  Settings,
  Typebot,
} from '@typebot.io/schemas'
import {
  WhatsAppCredentials,
  WhatsAppIncomingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { isNotDefined } from '@typebot.io/lib'
import { decrypt } from '@typebot.io/lib/api/encryption'

type Props = {
  message: WhatsAppIncomingMessage
  sessionId: string
  workspaceId?: string
  phoneNumberId: string
  contact: NonNullable<SessionState['whatsApp']>['contact']
}

export const startWhatsAppSession = async ({
  message,
  workspaceId,
  phoneNumberId,
  contact,
}: Props): Promise<
  | (ChatReply & {
      newSessionState: SessionState
    })
  | undefined
> => {
  const publicTypebotsWithWhatsAppEnabled =
    (await prisma.publicTypebot.findMany({
      where: {
        typebot: { workspaceId, whatsAppPhoneNumberId: phoneNumberId },
      },
      select: {
        settings: true,
        typebot: {
          select: {
            publicId: true,
          },
        },
      },
    })) as (Pick<PublicTypebot, 'settings'> & {
      typebot: Pick<Typebot, 'publicId'>
    })[]

  const botsWithWhatsAppEnabled = publicTypebotsWithWhatsAppEnabled.filter(
    (publicTypebot) =>
      publicTypebot.typebot.publicId &&
      publicTypebot.settings.whatsApp?.credentialsId
  )

  const publicTypebot =
    botsWithWhatsAppEnabled.find(
      (publicTypebot) =>
        publicTypebot.settings.whatsApp?.startCondition &&
        messageMatchStartCondition(
          getIncomingMessageText(message),
          publicTypebot.settings.whatsApp?.startCondition
        )
    ) ?? botsWithWhatsAppEnabled[0]

  if (isNotDefined(publicTypebot)) return

  const encryptedCredentials = await prisma.credentials.findUnique({
    where: {
      id: publicTypebot.settings.whatsApp?.credentialsId,
    },
  })
  if (!encryptedCredentials) return
  const credentials = (await decrypt(
    encryptedCredentials?.data,
    encryptedCredentials?.iv
  )) as WhatsAppCredentials['data']

  if (credentials.phoneNumberId !== phoneNumberId) return

  const session = await startSession({
    startParams: {
      typebot: publicTypebot.typebot.publicId as string,
    },
    userId: undefined,
  })

  return {
    ...session,
    newSessionState: {
      ...session.newSessionState,
      whatsApp: {
        contact,
        credentialsId: publicTypebot?.settings.whatsApp
          ?.credentialsId as string,
      },
    },
  }
}

export const messageMatchStartCondition = (
  message: string,
  startCondition: NonNullable<Settings['whatsApp']>['startCondition']
) => {
  if (!startCondition) return true
  return startCondition.logicalOperator === LogicalOperator.AND
    ? startCondition.comparisons.every((comparison) =>
        matchComparison(
          message,
          comparison.comparisonOperator,
          comparison.value
        )
      )
    : startCondition.comparisons.some((comparison) =>
        matchComparison(
          message,
          comparison.comparisonOperator,
          comparison.value
        )
      )
}

const matchComparison = (
  inputValue: string,
  comparisonOperator?: ComparisonOperators,
  value?: string
): boolean | undefined => {
  if (!comparisonOperator) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      if (!value) return false
      return inputValue
        .trim()
        .toLowerCase()
        .includes(value.trim().toLowerCase())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value
    }
    case ComparisonOperators.GREATER: {
      if (!value) return false
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      if (!value) return false
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return inputValue.length > 0
    }
    case ComparisonOperators.IS_EMPTY: {
      return inputValue.length === 0
    }
    case ComparisonOperators.STARTS_WITH: {
      if (!value) return false
      return inputValue.toLowerCase().startsWith(value.toLowerCase())
    }
    case ComparisonOperators.ENDS_WITH: {
      if (!value) return false
      return inputValue.toLowerCase().endsWith(value.toLowerCase())
    }
    case ComparisonOperators.NOT_CONTAINS: {
      if (!value) return false
      return !inputValue
        .trim()
        .toLowerCase()
        .includes(value.trim().toLowerCase())
    }
  }
}

const getIncomingMessageText = (message: WhatsAppIncomingMessage): string => {
  switch (message.type) {
    case 'text':
      return message.text.body
    case 'button':
      return message.button.text
    case 'interactive': {
      return message.interactive.button_reply.title
    }
    case 'video':
    case 'document':
    case 'audio':
    case 'image': {
      return ''
    }
  }
}
