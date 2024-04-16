import { NextApiRequest, NextApiResponse } from 'next'
import { createPlateEditor } from '@udecode/plate-core'

export const config = {
  supportsResponseStreaming: true,
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  console.log(createPlateEditor())
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ctx = globalThis[Symbol.for('@vercel/request-context')]
  ctx.get().waitUntil(wait)
  return res.status(200).send('Message is being processed.')
}

const wait = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000))
  return
}
