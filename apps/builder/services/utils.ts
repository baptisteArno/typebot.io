import { Parser } from 'htmlparser2'

export const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init)
  return res.json()
}

export const isMobile =
  typeof window !== 'undefined' &&
  window.matchMedia('only screen and (max-width: 760px)').matches

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

export const insertItemInList = <T>(
  arr: T[],
  index: number,
  newItem: T
): T[] => [...arr.slice(0, index), newItem, ...arr.slice(index)]

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return <T>value !== undefined && <T>value !== null
}

export const isNotDefined = <T>(value: T | undefined | null): value is T => {
  return <T>value === undefined || <T>value === null
}

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
