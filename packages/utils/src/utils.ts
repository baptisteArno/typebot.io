import {
  BubbleStep,
  BubbleStepType,
  ChoiceInputStep,
  ConditionStep,
  InputStep,
  InputStepType,
  IntegrationStep,
  IntegrationStepType,
  LogicStep,
  LogicStepType,
  Step,
  TextInputStep,
  TextBubbleStep,
  WebhookStep,
  StepType,
  StepWithOptionsType,
  PublicStep,
} from 'models'

export const sendRequest = async <ResponseData>({
  url,
  method,
  body,
}: {
  url: string
  method: string
  body?: Record<string, unknown>
}): Promise<{ data?: ResponseData; error?: Error }> => {
  try {
    const response = await fetch(url, {
      method,
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(response.statusText)
    const data = await response.json()
    return { data }
  } catch (e) {
    console.error(e)
    return { error: e as Error }
  }
}

export const isDefined = <T>(
  value: T | undefined | null
): value is NonNullable<T> => value !== undefined && value !== null

export const isNotDefined = <T>(
  value: T | undefined | null
): value is undefined | null => value === undefined || value === null

export const isInputStep = (step: Step | PublicStep): step is InputStep =>
  (Object.values(InputStepType) as string[]).includes(step.type)

export const isBubbleStep = (step: Step | PublicStep): step is BubbleStep =>
  (Object.values(BubbleStepType) as string[]).includes(step.type)

export const isLogicStep = (step: Step | PublicStep): step is LogicStep =>
  (Object.values(LogicStepType) as string[]).includes(step.type)

export const isTextBubbleStep = (
  step: Step | PublicStep
): step is TextBubbleStep => step.type === BubbleStepType.TEXT

export const isTextInputStep = (
  step: Step | PublicStep
): step is TextInputStep => step.type === InputStepType.TEXT

export const isChoiceInput = (
  step: Step | PublicStep
): step is ChoiceInputStep => step.type === InputStepType.CHOICE

export const isSingleChoiceInput = (
  step: Step | PublicStep
): step is ChoiceInputStep =>
  step.type === InputStepType.CHOICE &&
  'options' in step &&
  !step.options.isMultipleChoice

export const isConditionStep = (
  step: Step | PublicStep
): step is ConditionStep => step.type === LogicStepType.CONDITION

export const isIntegrationStep = (
  step: Step | PublicStep
): step is IntegrationStep =>
  (Object.values(IntegrationStepType) as string[]).includes(step.type)

export const isWebhookStep = (step: Step | PublicStep): step is WebhookStep =>
  step.type === IntegrationStepType.WEBHOOK

export const isBubbleStepType = (type: StepType): type is BubbleStepType =>
  (Object.values(BubbleStepType) as string[]).includes(type)

export const stepTypeHasOption = (
  type: StepType
): type is StepWithOptionsType =>
  (Object.values(InputStepType) as string[])
    .concat(Object.values(LogicStepType))
    .concat(Object.values(IntegrationStepType))
    .includes(type)

export const stepTypeHasWebhook = (
  type: StepType
): type is IntegrationStepType.WEBHOOK => type === IntegrationStepType.WEBHOOK

export const stepTypeHasItems = (
  type: StepType
): type is LogicStepType.CONDITION | InputStepType.CHOICE =>
  type === LogicStepType.CONDITION || type === InputStepType.CHOICE

export const stepHasItems = (
  step: Step
): step is ConditionStep | ChoiceInputStep => 'items' in step

export const byId = (id?: string) => (obj: { id: string }) => obj.id === id
