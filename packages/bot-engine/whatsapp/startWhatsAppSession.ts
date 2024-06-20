import prisma from '@sniper.io/lib/prisma'
import {
  ContinueChatResponse,
  PublicSniper,
  SessionState,
  SetVariableHistoryItem,
  Settings,
  Sniper,
} from '@sniper.io/schemas'
import {
  WhatsAppCredentials,
  defaultSessionExpiryTimeout,
} from '@sniper.io/schemas/features/whatsapp'
import { isNotDefined } from '@sniper.io/lib/utils'
import { startSession } from '../startSession'
import {
  LogicalOperator,
  ComparisonOperators,
} from '@sniper.io/schemas/features/blocks/logic/condition/constants'
import { VisitedEdge } from '@sniper.io/prisma'
import { Reply } from '../types'

type Props = {
  incomingMessage?: Reply
  workspaceId: string
  credentials: WhatsAppCredentials['data'] & Pick<WhatsAppCredentials, 'id'>
  contact: NonNullable<SessionState['whatsApp']>['contact']
}

export const startWhatsAppSession = async ({
  incomingMessage,
  workspaceId,
  credentials,
  contact,
}: Props): Promise<
  | (ContinueChatResponse & {
      newSessionState: SessionState
      visitedEdges: VisitedEdge[]
      setVariableHistory: SetVariableHistoryItem[]
    })
  | { error: string }
> => {
  const publicSnipersWithWhatsAppEnabled = (await prisma.publicSniper.findMany({
    where: {
      sniper: { workspaceId, whatsAppCredentialsId: credentials.id },
    },
    select: {
      settings: true,
      sniper: {
        select: {
          publicId: true,
        },
      },
    },
  })) as (Pick<PublicSniper, 'settings'> & {
    sniper: Pick<Sniper, 'publicId'>
  })[]

  const botsWithWhatsAppEnabled = publicSnipersWithWhatsAppEnabled.filter(
    (publicSniper) =>
      publicSniper.sniper.publicId && publicSniper.settings.whatsApp?.isEnabled
  )

  const publicSniperWithMatchedCondition = botsWithWhatsAppEnabled.find(
    (publicSniper) =>
      (publicSniper.settings.whatsApp?.startCondition?.comparisons.length ??
        0) > 0 &&
      messageMatchStartCondition(
        incomingMessage ?? '',
        publicSniper.settings.whatsApp?.startCondition
      )
  )

  const publicSniper =
    publicSniperWithMatchedCondition ??
    botsWithWhatsAppEnabled.find(
      (publicSniper) => !publicSniper.settings.whatsApp?.startCondition
    )

  if (isNotDefined(publicSniper))
    return botsWithWhatsAppEnabled.length > 0
      ? { error: 'Message did not matched any condition' }
      : { error: 'No public sniper with WhatsApp integration found' }

  const sessionExpiryTimeoutHours =
    publicSniper.settings.whatsApp?.sessionExpiryTimeout ??
    defaultSessionExpiryTimeout

  return startSession({
    version: 2,
    message: incomingMessage,
    startParams: {
      type: 'live',
      publicId: publicSniper.sniper.publicId as string,
      isOnlyRegistering: false,
      isStreamEnabled: false,
      textBubbleContentFormat: 'richText',
    },
    initialSessionState: {
      whatsApp: {
        contact,
      },
      expiryTimeout: sessionExpiryTimeoutHours * 60 * 60 * 1000,
    },
  })
}

export const messageMatchStartCondition = (
  message: Reply,
  startCondition: NonNullable<Settings['whatsApp']>['startCondition']
) => {
  if (!startCondition) return true
  if (typeof message !== 'string') return false
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
