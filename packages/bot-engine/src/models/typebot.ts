import { Typebot as TypebotFromPrisma } from 'db'

export type Typebot = Omit<
  TypebotFromPrisma,
  'blocks' | 'startBlock' | 'theme'
> & {
  blocks: Block[]
  startBlock: StartBlock
  theme: Theme
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
  TEXT_INPUT = 'text input',
}

export type Target = { blockId: string; stepId?: string }

export type Step = BubbleStep | InputStep
export type BubbleStep = TextStep
export type InputStep = TextInputStep
export type StepBase = { id: string; blockId: string; target?: Target }
export type TextStep = StepBase & {
  type: StepType.TEXT
  content: { html: string; richText: unknown[]; plainText: string }
}
export type TextInputStep = StepBase & {
  type: StepType.TEXT_INPUT
}

export type Theme = {
  general: {
    font: string
    background: Background
  }
}

export enum BackgroundType {
  COLOR = 'Color',
  IMAGE = 'Image',
  NONE = 'None',
}

export type Background = {
  type: BackgroundType
  content: string
}
