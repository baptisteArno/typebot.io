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
