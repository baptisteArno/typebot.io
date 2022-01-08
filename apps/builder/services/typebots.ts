import {
  Block,
  TextStep,
  PublicTypebot,
  BackgroundType,
  Settings,
  StartStep,
  Theme,
  BubbleStep,
  InputStep,
  BubbleStepType,
  InputStepType,
} from 'models'
import shortId from 'short-uuid'
import { Typebot } from 'models'
import useSWR from 'swr'
import { fetcher, sendRequest, toKebabCase } from './utils'
import { deepEqual } from 'fast-equals'
import { stringify } from 'qs'

export const useTypebots = ({
  folderId,
  onError,
}: {
  folderId?: string
  onError: (error: Error) => void
}) => {
  const params = stringify({ folderId })
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
  totalBlocks,
  initialCoordinates,
}: {
  totalBlocks: number
  initialCoordinates: { x: number; y: number }
}): Block => {
  const id = `b${shortId.generate()}`
  return {
    id,
    title: `Block #${totalBlocks + 1}`,
    graphCoordinates: initialCoordinates,
    stepIds: [],
  }
}

export const parseNewStep = (
  type: BubbleStepType | InputStepType,
  blockId: string
): BubbleStep | InputStep => {
  const id = `s${shortId.generate()}`
  switch (type) {
    case BubbleStepType.TEXT: {
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
    default: {
      return {
        id,
        blockId,
        type,
      }
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
  deepEqual(typebot.steps, publicTypebot.steps) &&
  typebot.name === publicTypebot.name &&
  typebot.publicId === publicTypebot.publicId &&
  deepEqual(typebot.settings, publicTypebot.settings) &&
  deepEqual(typebot.theme, publicTypebot.theme)

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(name) + `-${id?.slice(-7)}`

export const parseNewTypebot = ({
  ownerId,
  folderId,
  name,
}: {
  ownerId: string
  folderId: string | null
  name: string
}): Partial<Typebot> => {
  const startBlockId = shortId.generate()
  const startStepId = shortId.generate()
  const startStep: StartStep = {
    blockId: startBlockId,
    id: startStepId,
    label: 'Start',
    type: 'start',
  }
  const startBlock: Block = {
    id: startBlockId,
    title: 'Start',
    graphCoordinates: { x: 0, y: 0 },
    stepIds: [startStepId],
  }
  const theme: Theme = {
    general: {
      font: 'Open Sans',
      background: { type: BackgroundType.NONE, content: '#ffffff' },
    },
  }
  const settings: Settings = {
    typingEmulation: {
      enabled: true,
      speed: 300,
      maxDelay: 1.5,
    },
  }
  return {
    folderId,
    name,
    ownerId,
    blocks: { byId: { [startBlockId]: startBlock }, allIds: [startBlockId] },
    steps: { byId: { [startStepId]: startStep }, allIds: [startStepId] },
    theme,
    settings,
  }
}
