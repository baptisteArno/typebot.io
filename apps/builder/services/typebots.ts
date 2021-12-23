import {
  Step,
  StepType,
  Block,
  TextStep,
  PublicTypebot,
  TextInputStep,
} from 'bot-engine'
import shortId from 'short-uuid'
import { Typebot } from 'bot-engine'
import useSWR from 'swr'
import { fetcher, sendRequest } from './utils'
import { deepEqual } from 'fast-equals'

export const useTypebots = ({
  folderId,
  onError,
}: {
  folderId?: string
  onError: (error: Error) => void
}) => {
  const params = new URLSearchParams(
    folderId ? { folderId: folderId.toString() } : undefined
  )
  const { data, error, mutate } = useSWR<{ typebots: Typebot[] }, Error>(
    `/api/typebots?${params}`,
    fetcher
  )
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}

export const createTypebot = async ({
  folderId,
}: Pick<Typebot, 'folderId'>) => {
  const typebot = {
    folderId,
    name: 'My typebot',
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}

export const duplicateTypebot = async ({
  folderId,
  ownerId,
  name,
}: Typebot) => {
  const typebot = {
    folderId,
    ownerId,
    name: `${name} copy`,
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}

export const deleteTypebot = async (id: string) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'DELETE',
  })

export const updateTypebot = async (id: string, typebot: Partial<Typebot>) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'PATCH',
    body: typebot,
  })

export const parseNewBlock = ({
  type,
  totalBlocks,
  initialCoordinates,
  step,
}: {
  step?: Step
  type?: StepType
  totalBlocks: number
  initialCoordinates: { x: number; y: number }
}): Block => {
  const id = `b${shortId.generate()}`
  return {
    id,
    title: `Block #${totalBlocks + 1}`,
    graphCoordinates: initialCoordinates,
    steps: [
      step ? { ...step, blockId: id } : parseNewStep(type as StepType, id),
    ],
  }
}

export const parseNewStep = (type: StepType, blockId: string): Step => {
  const id = `s${shortId.generate()}`
  switch (type) {
    case StepType.TEXT: {
      const textStep: Pick<TextStep, 'type' | 'content'> = {
        type,
        content: { html: '', richText: [], plainText: '' },
      }
      return {
        id,
        blockId,
        ...textStep,
      }
    }
    case StepType.TEXT_INPUT: {
      const textStep: Pick<TextInputStep, 'type'> = {
        type,
      }
      return {
        id,
        blockId,
        ...textStep,
      }
    }
    default: {
      const textStep: Pick<TextStep, 'type' | 'content'> = {
        type: StepType.TEXT,
        content: { html: '', richText: [], plainText: '' },
      }
      return { blockId, id, ...textStep }
    }
  }
}

export const checkIfTypebotsAreEqual = (
  firstChatbot: Typebot,
  secondChatbot: Typebot
) =>
  deepEqual(
    {
      ...firstChatbot,
    },
    {
      ...secondChatbot,
    }
  )

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: shortId.generate(),
  blocks: typebot.blocks,
  name: typebot.name,
  startBlock: typebot.startBlock,
  typebotId: typebot.id,
  theme: typebot.theme,
})
