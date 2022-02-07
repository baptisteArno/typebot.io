import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Prisma, User } from 'db'
import prisma from 'libs/prisma'
import { googleSheetsScopes } from './consent-url'
import { stringify } from 'querystring'
import { CredentialsType } from 'models'
import { encrypt } from 'utils'
import { oauth2Client } from 'libs/google-sheets'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const { redirectUrl, stepId } = JSON.parse(
    Buffer.from(req.query.state.toString(), 'base64').toString()
  )
  if (req.method === 'GET') {
    const code = req.query.code.toString()
    if (!code)
      return res.status(400).send({ message: "Bad request, couldn't get code" })
    if (!session?.user)
      return res.status(401).json({ message: 'Not authenticated' })
    const user = session.user as User
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens?.access_token) {
      console.error('Error getting oAuth tokens:')
      throw new Error('ERROR')
    }
    oauth2Client.setCredentials(tokens)
    const { email, scopes } = await oauth2Client.getTokenInfo(
      tokens.access_token
    )
    if (!email)
      return res
        .status(400)
        .send({ message: "Couldn't get email from getTokenInfo" })
    if (googleSheetsScopes.some((scope) => !scopes.includes(scope)))
      return res
        .status(400)
        .send({ message: "User didn't accepted required scopes" })
    const { encryptedData, iv } = encrypt(tokens)
    const credentials = {
      name: email,
      type: CredentialsType.GOOGLE_SHEETS,
      ownerId: user.id,
      data: encryptedData,
      iv,
    } as Prisma.CredentialsUncheckedCreateInput
    const { id: credentialsId } = await prisma.credentials.upsert({
      create: credentials,
      update: credentials,
      where: {
        name_type_ownerId: {
          name: credentials.name,
          type: credentials.type,
          ownerId: user.id,
        },
      },
    })
    const queryParams = stringify({ stepId, credentialsId })
    return res.redirect(
      `${redirectUrl}?${queryParams}` ?? `${process.env.NEXTAUTH_URL}`
    )
  }
}

export default handler
