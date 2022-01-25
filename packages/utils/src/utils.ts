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
  Table,
  TextInputStep,
  TextBubbleStep,
  WebhookStep,
  StepType,
  StepWithOptionsType,
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

export const filterTable = <T>(ids: string[], table: Table<T>): Table<T> => ({
  byId: ids.reduce((acc, id) => ({ ...acc, [id]: table.byId[id] }), {}),
  allIds: ids,
})

export const isInputStep = (step: Step): step is InputStep =>
  (Object.values(InputStepType) as string[]).includes(step.type)

export const isBubbleStep = (step: Step): step is BubbleStep =>
  (Object.values(BubbleStepType) as string[]).includes(step.type)

export const isLogicStep = (step: Step): step is LogicStep =>
  (Object.values(LogicStepType) as string[]).includes(step.type)

export const isTextBubbleStep = (step: Step): step is TextBubbleStep =>
  step.type === BubbleStepType.TEXT

export const isTextInputStep = (step: Step): step is TextInputStep =>
  step.type === InputStepType.TEXT

export const isChoiceInput = (step: Step): step is ChoiceInputStep =>
  step.type === InputStepType.CHOICE

export const isSingleChoiceInput = (step: Step): step is ChoiceInputStep =>
  step.type === InputStepType.CHOICE && !step.options.isMultipleChoice

export const isConditionStep = (step: Step): step is ConditionStep =>
  step.type === LogicStepType.CONDITION

export const isIntegrationStep = (step: Step): step is IntegrationStep =>
  (Object.values(IntegrationStepType) as string[]).includes(step.type)

export const isWebhookStep = (step: Step): step is WebhookStep =>
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
