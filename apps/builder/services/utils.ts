import { Parser } from 'htmlparser2'
import { Step } from 'models'

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

export const removeUndefinedFields = <T>(obj: T): T =>
  Object.keys(obj).reduce(
    (acc, key) =>
      obj[key as keyof T] === undefined
        ? { ...acc }
        : { ...acc, [key]: obj[key as keyof T] },
    {} as T
  )

export const stepHasOptions = (step: Step) => 'options' in step
