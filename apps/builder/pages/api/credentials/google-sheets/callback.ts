// import { NextApiRequest, NextApiResponse } from 'next'
// //import { Prisma } from 'db'
// //import prisma from 'libs/prisma'
// import { googleSheetsScopes } from './consent-url'
// import { stringify } from 'querystring'
// import { CredentialsType } from 'models'
// import { badRequest, encrypt, notAuthenticated } from 'utils'
// import { oauth2Client } from 'libs/google-sheets'
// import { withSentry } from '@sentry/nextjs'
// import { getAuthenticatedUser } from 'services/api/utils'

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const user = await getAuthenticatedUser(req)
//   if (!user) return notAuthenticated(res)
//   const { redirectUrl, stepId, workspaceId } = JSON.parse(
//     Buffer.from(req.query.state.toString(), 'base64').toString()
//   )
//   if (req.method === 'GET') {
//     const code = req.query.code.toString()
//     if (!workspaceId) return badRequest(res)
//     if (!code)
//       return res.status(400).send({ message: "Bad request, couldn't get code" })
//     const { tokens } = await oauth2Client.getToken(code)
//     if (!tokens?.access_token) {
//       console.error('Error getting oAuth tokens:')
//       throw new Error('ERROR')
//     }
//     oauth2Client.setCredentials(tokens)
//     const { email, scopes } = await oauth2Client.getTokenInfo(
//       tokens.access_token
//     )
//     if (!email)
//       return res
//         .status(400)
//         .send({ message: "Couldn't get email from getTokenInfo" })
//     if (googleSheetsScopes.some((scope) => !scopes.includes(scope)))
//       return res
//         .status(400)
//         .send({ message: "User didn't accepted required scopes" })
//     // console.log(tokens)
//     const { encryptedData, iv } = encrypt(tokens)
//     const credentials = {
//       name: email,
//       type: CredentialsType.GOOGLE_SHEETS,
//       workspaceId,
//       data: encryptedData,
//       iv,
//     } as Prisma.CredentialsUncheckedCreateInput
//     const { id: credentialsId } = await prisma.credentials.create({
//       data: credentials,
//     })
//     const queryParams = stringify({ stepId, credentialsId })
//     res.redirect(
//       `${redirectUrl}?${queryParams}` ?? `${process.env.NEXTAUTH_URL}`
//     )
//   }
// }

// export default withSentry(handler)
