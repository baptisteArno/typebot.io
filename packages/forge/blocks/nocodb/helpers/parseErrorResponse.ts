export const parseErrorResponse = async (res: Response) => {
  if (res.headers.get('content-type')?.includes('application/json')) {
    const json = await res.json()
    if ('msg' in json) return json.msg
    return json
  }

  return res.text()
}
