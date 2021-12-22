import { Step, TextStep, StepType, TextInputStep } from '../models'

export const isTextStep = (step: Step): step is TextStep =>
  step.type === StepType.TEXT

export const isTextInputStep = (step: Step): step is TextInputStep =>
  step.type === StepType.TEXT_INPUT
