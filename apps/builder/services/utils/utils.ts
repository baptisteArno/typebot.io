import imageCompression from 'browser-image-compression'
import { Parser } from 'htmlparser2'
import { PublicStep, Step, Typebot } from 'models'

export const fetcher = async (input: RequestInfo, init?: RequestInit) => {
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

export const uploadFile = async (file: File, key: string) => {
  const res = await fetch(
    `/api/storage/upload-url?key=${encodeURIComponent(
      key
    )}&fileType=${encodeURIComponent(file.type)}`
  )
  const { url, fields } = await res.json()
  const formData = new FormData()

  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value as string | Blob)
  })

  const upload = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  return {
    url: upload.ok ? `${url}/${key}` : null,
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

export const stepHasOptions = (step: Step | PublicStep) => 'options' in step

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
