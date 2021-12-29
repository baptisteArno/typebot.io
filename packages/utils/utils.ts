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
