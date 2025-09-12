import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@typebot.io/lib/prisma'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthenticatedUser(req, res)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { typebotId } = req.query
    if (!typebotId || typeof typebotId !== 'string') {
      return res.status(400).json({ error: 'Missing typebotId' })
    }

    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        isBeingEdited: true,
        editingUserEmail: true,
        editingUserName: true,
        editingStartedAt: true,
      },
    })

    if (!typebot) {
      return res.status(404).json({ error: 'Typebot not found' })
    }

    // Verificar se o usuário pode limpar o status
    if (typebot.isBeingEdited && typebot.editingUserEmail !== user.email) {
      return res.status(403).json({
        error: 'Not authorized to release editing status for this typebot',
      })
    }

    // Limpar status de edição
    const updateResult = await prisma.typebot.update({
      where: { id: typebotId },
      data: {
        isBeingEdited: false,
        editingUserEmail: null,
        editingUserName: null,
        editingStartedAt: null,
      },
    })

    return res.status(200).json({
      success: true,
      updatedAt: updateResult.updatedAt,
    })
  } catch (error) {
    console.error('❌ HTTP API: Failed to release editing status:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
