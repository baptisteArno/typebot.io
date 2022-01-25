import {
  Block,
  Typebot,
  Table,
  Step,
  ChoiceItem,
  defaultTheme,
  defaultSettings,
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
  return {
    id,
    folderId: null,
    name,
    ownerId,
    theme: defaultTheme,
    settings: defaultSettings,
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
          edgeId: 'edge1',
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
    webhooks: { byId: {}, allIds: [] },
    edges: {
      byId: {
        edge1: {
          id: 'edge1',
          from: { blockId: 'block0', stepId: 'step0' },
          to: { blockId: 'block1' },
        },
      },
      allIds: ['edge1'],
    },
  }
}

export const preventUserFromRefreshing = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}
