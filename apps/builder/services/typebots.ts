import {
  Step,
  StepType,
  Block,
  TextStep,
  TextInputStep,
  PublicTypebot,
} from 'bot-engine'
import shortId from 'short-uuid'
import { Typebot } from 'bot-engine'
import useSWR from 'swr'
import { fetcher, sendRequest, toKebabCase } from './utils'
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

export const updateTypebot = async (id: string, typebot: Typebot) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'PUT',
    body: typebot,
  })

export const patchTypebot = async (id: string, typebot: Partial<Typebot>) =>
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

export const checkIfPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot
) =>
  deepEqual(typebot.blocks, publicTypebot.blocks) &&
  deepEqual(typebot.startBlock, publicTypebot.startBlock) &&
  typebot.name === publicTypebot.name &&
  typebot.publicId === publicTypebot.publicId &&
  deepEqual(typebot.settings, publicTypebot.settings) &&
  deepEqual(typebot.theme, publicTypebot.theme)

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(`${name}-${id?.slice(0, 5)}`)
