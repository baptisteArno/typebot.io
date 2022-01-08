import {
  BubbleStepType,
  InputStep,
  InputStepType,
  Step,
  Table,
  TextInputStep,
  TextStep,
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

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return <T>value !== undefined && <T>value !== null
}

export const filterTable = <T>(ids: string[], table: Table<T>): Table<T> => ({
  byId: ids.reduce((acc, id) => ({ ...acc, [id]: table.byId[id] }), {}),
  allIds: ids,
})

export const isInputStep = (step: Step): step is InputStep =>
  (Object.values(InputStepType) as string[]).includes(step.type)

export const isTextBubbleStep = (step: Step): step is TextStep =>
  step.type === BubbleStepType.TEXT

export const isTextInputStep = (step: Step): step is TextInputStep =>
  step.type === InputStepType.TEXT
