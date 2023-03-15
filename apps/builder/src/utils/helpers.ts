import imageCompression from 'browser-image-compression'
import { Block, Typebot } from '@typebot.io/schemas'

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

export const toKebabCase = (value: string) => {
  const matched = value.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
  )
  if (!matched) return ''
  return matched.map((x) => x.toLowerCase()).join('-')
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

export const removeUndefinedFields = <T extends Record<string, unknown>>(
  obj: T
): T =>
  Object.keys(obj).reduce(
    (acc, key) =>
      obj[key as keyof T] === undefined
        ? { ...acc }
        : { ...acc, [key]: obj[key as keyof T] },
    {} as T
  )

export const blockHasOptions = (block: Block) => 'options' in block

export const parseVariableHighlight = (content: string, typebot: Typebot) => {
  const varNames = typebot.variables.map((v) => v.name)
  return content.replace(/\{\{(.*?)\}\}/g, (fullMatch, foundVar) => {
    if (content.includes(`href="{{${foundVar}}}"`)) return fullMatch
    if (varNames.some((val) => foundVar === val)) {
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
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  )

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
    return Math.floor(interval) + 'd'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + 'h'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + 'm'
  }
  return Math.floor(seconds) + 's'
}

export const isCloudProdInstance =
  typeof window !== 'undefined' && window.location.hostname === 'app.typebot.io'

export const numberWithCommas = (x: number) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
