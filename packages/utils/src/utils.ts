import {
  BubbleBlock,
  BubbleBlockType,
  ChoiceInputBlock,
  ConditionBlock,
  InputBlock,
  InputBlockType,
  IntegrationBlock,
  IntegrationBlockType,
  LogicBlock,
  LogicBlockType,
  Block,
  TextInputBlock,
  TextBubbleBlock,
  WebhookBlock,
  BlockType,
  BlockWithOptionsType,
  ImageBubbleBlock,
  VideoBubbleBlock,
} from 'models'

export const sendRequest = async <ResponseData>(
  params:
    | {
        url: string
        method: string
        body?: Record<string, unknown> | FormData
      }
    | string
): Promise<{ data?: ResponseData; error?: Error }> => {
  try {
    const url = typeof params === 'string' ? params : params.url
    const response = await fetch(url, {
      method: typeof params === 'string' ? 'GET' : params.method,
      mode: 'cors',
      headers:
        typeof params !== 'string' && isDefined(params.body)
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
      body:
        typeof params !== 'string' && isDefined(params.body)
          ? JSON.stringify(params.body)
          : undefined,
    })
    const data = await response.json()
    if (!response.ok) throw 'error' in data ? data.error : data
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

export const isEmpty = (value: string | undefined | null): value is undefined =>
  value === undefined || value === null || value === ''

export const isNotEmpty = (value: string | undefined | null): value is string =>
  value !== undefined && value !== null && value !== ''

export const isInputBlock = (block: Block): block is InputBlock =>
  (Object.values(InputBlockType) as string[]).includes(block.type)

export const isBubbleBlock = (block: Block): block is BubbleBlock =>
  (Object.values(BubbleBlockType) as string[]).includes(block.type)

export const isLogicBlock = (block: Block): block is LogicBlock =>
  (Object.values(LogicBlockType) as string[]).includes(block.type)

export const isTextBubbleBlock = (block: Block): block is TextBubbleBlock =>
  block.type === BubbleBlockType.TEXT

export const isMediaBubbleBlock = (
  block: Block
): block is ImageBubbleBlock | VideoBubbleBlock =>
  block.type === BubbleBlockType.IMAGE || block.type === BubbleBlockType.VIDEO

export const isTextInputBlock = (block: Block): block is TextInputBlock =>
  block.type === InputBlockType.TEXT

export const isChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE

export const isSingleChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE &&
  'options' in block &&
  !block.options.isMultipleChoice

export const isConditionBlock = (block: Block): block is ConditionBlock =>
  block.type === LogicBlockType.CONDITION

export const isIntegrationBlock = (block: Block): block is IntegrationBlock =>
  (Object.values(IntegrationBlockType) as string[]).includes(block.type)

export const isWebhookBlock = (block: Block): block is WebhookBlock =>
  [
    IntegrationBlockType.WEBHOOK,
    IntegrationBlockType.PABBLY_CONNECT,
    IntegrationBlockType.ZAPIER,
    IntegrationBlockType.MAKE_COM,
  ].includes(block.type as IntegrationBlockType)

export const isBubbleBlockType = (type: BlockType): type is BubbleBlockType =>
  (Object.values(BubbleBlockType) as string[]).includes(type)

export const blockTypeHasOption = (
  type: BlockType
): type is BlockWithOptionsType =>
  (Object.values(InputBlockType) as string[])
    .concat(Object.values(LogicBlockType))
    .concat(Object.values(IntegrationBlockType))
    .includes(type)

export const blockTypeHasWebhook = (
  type: BlockType
): type is IntegrationBlockType.WEBHOOK =>
  Object.values([
    IntegrationBlockType.WEBHOOK,
    IntegrationBlockType.ZAPIER,
    IntegrationBlockType.MAKE_COM,
    IntegrationBlockType.PABBLY_CONNECT,
  ] as string[]).includes(type)

export const blockTypeHasItems = (
  type: BlockType
): type is LogicBlockType.CONDITION | InputBlockType.CHOICE =>
  type === LogicBlockType.CONDITION || type === InputBlockType.CHOICE

export const blockHasItems = (
  block: Block
): block is ConditionBlock | ChoiceInputBlock =>
  'items' in block && isDefined(block.items)

export const byId = (id?: string) => (obj: { id: string }) => obj.id === id

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface Omit {
  // eslint-disable-next-line @typescript-eslint/ban-types
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2]
  }
}

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: typeof obj[K]
  }
  let key: keyof typeof obj
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key]
    }
  }
  return ret
}

export const sanitizeUrl = (url: string): string =>
  url.startsWith('http') ||
  url.startsWith('mailto:') ||
  url.startsWith('tel:') ||
  url.startsWith('sms:')
    ? url
    : `https://${url}`

export const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  )

export const generateId = (idDesiredLength: number): string => {
  const getRandomCharFromAlphabet = (alphabet: string): string => {
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  return Array.from({ length: idDesiredLength })
    .map(() => {
      return getRandomCharFromAlphabet(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      )
    })
    .join('')
}

type UploadFileProps = {
  files: {
    file: File
    path: string
  }[]
  onUploadProgress?: (percent: number) => void
}
type UrlList = string[]

export const uploadFiles = async ({
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  const requests = files.map(async ({ file, path }) => {
    const { data } = await sendRequest<{
      presignedUrl: { url: string; fields: any }
    }>(
      `/api/storage/upload-url?filePath=${encodeURIComponent(path)}&fileType=${
        file.type
      }`
    )

    if (!data?.presignedUrl) return null

    const { url, fields } = data.presignedUrl
    const formData = new FormData()
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value as string | Blob)
    })
    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!upload.ok) return

    return `${url.split('?')[0]}/${path}`
  })
  const urls = []
  let i = 0
  for (const request of requests) {
    i += 1
    const url = await request
    onUploadProgress && onUploadProgress((i / requests.length) * 100)
    if (!url) continue
    urls.push(url)
  }
  return urls
}

declare const window: any

const isBrowser = () => {
  return Boolean(typeof window !== 'undefined' && window.__env)
}

export const env = (key = ''): string | undefined => {
  if (isBrowser() && window.__env) {
    return window.__env[key] === "''" ? undefined : window.__env[key]
  }

  return process.env['NEXT_PUBLIC_' + key] === "''"
    ? undefined
    : (process.env['NEXT_PUBLIC_' + key] as string)
}
