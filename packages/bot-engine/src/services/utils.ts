import { Prisma } from 'db'
import {
  Step,
  TextStep,
  StepType,
  TextInputStep,
  BackgroundType,
  Settings,
  StartBlock,
  Theme,
} from '../models'

export const isTextStep = (step: Step): step is TextStep =>
  step.type === StepType.TEXT

export const isTextInputStep = (step: Step): step is TextInputStep =>
  step.type === StepType.TEXT_INPUT

export const parseNewTypebot = ({
  ownerId,
  folderId,
  name,
}: {
  ownerId: string
  folderId: string | null
  name: string
}): Prisma.TypebotUncheckedCreateInput => {
  const startBlock: StartBlock = {
    id: 'start-block',
    title: 'Start',
    graphCoordinates: { x: 0, y: 0 },
    steps: [
      {
        id: 'start-step',
        blockId: 'start-block',
        label: 'Form starts here',
        type: StepType.START,
      },
    ],
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
  return { folderId, name, ownerId, startBlock, theme, settings }
}
