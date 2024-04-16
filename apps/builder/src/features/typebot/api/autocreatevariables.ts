import { createId } from '@paralleldrive/cuid2'

interface Credentials {
  baseUrl: string
  accountcode: string
  wsKey?: string
  cortexUrl?: string
  cortexAccountID?: string
  cortexToken?: string
}

export const createInstantVariables = async (input: Credentials) => {
  const body = {
    GetVariablesList: {
      key: input.wsKey,
      accountcodes: [input.accountcode],
      media: 'c',
    },
  }

  let datatoinsert: { id: string; name: string }[] = [] // eslint-disable-line

  try {
    const response = await fetch(`${input.baseUrl}/ivws/instantrest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.status < 300 && response.status >= 200) {
      const res = await response.json()
      for (const value of res) {
        let id = 'v' + createId() // eslint-disable-line
        datatoinsert.push({ id, name: value })
      }
    }
  } catch (e) {
    console.log('Error in finding variables', e)
  }
  return datatoinsert
}
