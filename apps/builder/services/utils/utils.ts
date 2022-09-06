import { headers, services } from '@octadesk-tech/services'
import imageCompression from 'browser-image-compression'
import { Parser } from 'htmlparser2'
import { Step, Typebot } from 'models'
import { sendRequest } from 'utils'

export const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  debugger
  const url = input.toString().replace(process.env.BASE_PATH_OCTADESK || '', '')
  if (url.startsWith('/api/typebots?')) {
    const client = await services.chatBots.getClient()
    const response = await client.get(`builder/all`, headers.getAuthorizedHeaders())
    return { typebots: response.data }
  }

  if (url.startsWith('/getTypebot-')) {
    const typebotId = url.replace('/getTypebot-', '')
    console.log('typebotId', typebotId)
    const client = await services.chatBots.getClient()
    const response = await client.get(`builder/${typebotId}`, headers.getAuthorizedHeaders())
    const typebot = response.data
    if (!typebot) return { typebot: null }

    const { publishedTypebot, webhooks, ...restOfTypebot } = typebot
    return {
      typebot: restOfTypebot,
      publishedTypebot,
      isReadOnly: false,
      webhooks,
    }
  }

  const res = await fetch(input, init)
  return res.json()
}

export const isMobile =
  typeof window !== 'undefined' &&
  window.matchMedia('only screen and (max-width: 760px)').matches

export const preventUserFromRefreshing = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

export const parseHtmlStringToPlainText = (html: string): string => {
  let label = ''
  const parser = new Parser({
    ontext(text) {
      label += `${text}`
    },
  })
  parser.write(html)
  parser.end()
  return label
}

export const toKebabCase = (value: string) => {
  const matched = value.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
  )
  if (!matched) return ''
  return matched.map((x) => x.toLowerCase()).join('-')
}

export const uploadFile = async (file: File, filePath: string) => {
  const { data } = await sendRequest<{ presignedUrl: string }>(
    `/api/storage/upload-url?filePath=${encodeURIComponent(filePath)}`
  )

  if (!data?.presignedUrl)
    return {
      url: null,
    }

  await fetch(data.presignedUrl, {
    method: 'PUT',
    body: file,
  })

  return {
    url: data.presignedUrl.split('?')[0],
  }
}

export const compressFile = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
  }
  return ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)
    ? imageCompression(file, options)
    : file
}

export const removeUndefinedFields = <T>(obj: T): T =>
  Object.keys(obj).reduce(
    (acc, key) =>
      obj[key as keyof T] === undefined
        ? { ...acc }
        : { ...acc, [key]: obj[key as keyof T] },
    {} as T
  )

export const stepHasOptions = (step: Step) => 'options' in step

export const parseVariableHighlight = (content: string, typebot: Typebot) => {
  const varNames = typebot.variables.map((v) => v.name)
  return content.replace(/\{\{(.*?)\}\}/g, (fullMatch, foundVar) => {
    if (varNames.some((val) => foundVar.includes(val))) {
      return `<span style="background-color:#ff8b1a; color:#ffffff; padding: 0.125rem 0.25rem; border-radius: 0.35rem">${fullMatch.replace(
        /{{|}}/g,
        ''
      )}</span>`
    }
    return fullMatch
  })
}

export const setMultipleRefs =
  (refs: React.MutableRefObject<HTMLDivElement | null>[]) =>
    (elem: HTMLDivElement) =>
      refs.forEach((ref) => (ref.current = elem))

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      fr.result && resolve(fr.result.toString())
    }
    fr.onerror = reject
    fr.readAsText(file)
  })
}

export const timeSince = (date: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' years'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes'
  }
  return Math.floor(seconds) + ' seconds'
}

export const isCloudProdInstance = () =>
  window.location.hostname === 'app.typebot.io'
