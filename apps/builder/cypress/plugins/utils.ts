import {
  Block,
  Theme,
  BackgroundType,
  Settings,
  Typebot,
  Table,
  Step,
  ChoiceItem,
} from 'models'

export const parseTestTypebot = ({
  id,
  ownerId,
  name,
  blocks,
  steps,
  choiceItems,
}: {
  id: string
  ownerId: string
  name: string
  blocks: Table<Block>
  steps: Table<Step>
  choiceItems?: Table<ChoiceItem>
}): Typebot => {
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
    id,
    folderId: null,
    name,
    ownerId,
    theme,
    settings,
    createdAt: new Date(),
    blocks: {
      byId: {
        block0: {
          id: 'block0',
          title: 'Block #0',
          stepIds: ['step0'],
          graphCoordinates: { x: 0, y: 0 },
        },
        ...blocks.byId,
      },
      allIds: ['block0', ...blocks.allIds],
    },
    steps: {
      byId: {
        step0: {
          id: 'step0',
          type: 'start',
          blockId: 'block0',
          label: 'Start',
          target: { blockId: 'block1' },
        },
        ...steps.byId,
      },
      allIds: ['step0', ...steps.allIds],
    },
    choiceItems: choiceItems ?? { byId: {}, allIds: [] },
    publicId: null,
    publishedTypebotId: null,
    updatedAt: new Date(),
    variables: { byId: {}, allIds: [] },
  }
}

export const preventUserFromRefreshing = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}
