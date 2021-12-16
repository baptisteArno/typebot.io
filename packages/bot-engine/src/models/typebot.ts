import { Typebot as TypebotFromPrisma } from 'db'

export type Typebot = TypebotFromPrisma & {
  blocks: Block[]
  startBlock: StartBlock
}

export type StartBlock = {
  id: `start-block`
  graphCoordinates: {
    x: number
    y: number
  }
  title: string
  steps: [StartStep]
}

export type StartStep = {
  id: 'start-step'
  blockId: 'start-block'
  target?: Target
  type: StepType.START
  label: string
}

export type Block = {
  id: string
  title: string
  steps: Step[]
  graphCoordinates: {
    x: number
    y: number
  }
}

export enum StepType {
  START = 'start',
  TEXT = 'text',
  IMAGE = 'image',
  BUTTONS = 'buttons',
  DATE_PICKER = 'date picker',
}

export type Target = { blockId: string; stepId?: string }

export type Step = { id: string; blockId: string; target?: Target } & (
  | TextStep
  | ImageStep
  | ButtonsStep
  | DatePickerStep
)

export type TextStep = {
  type: StepType.TEXT
  content: string
}

export type ImageStep = {
  type: StepType.IMAGE
  content: { url: string }
}

export type ButtonsStep = {
  type: StepType.BUTTONS
  buttons: Button[]
}

export type DatePickerStep = {
  type: StepType.DATE_PICKER
  content: string
}

export type Button = {
  id: string
  content: string
  target: {
    type: 'block' | 'step'
    id: string
  }
}
