import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Error accessing the database:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isDatabaseConnected = await checkDatabaseConnection()
  if (isDatabaseConnected) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDatabaseConnected ? 'ok' : 'not connected',
    })
  } else {
    res.status(500).json({
      status: 'error',
      test: 'viewer',
      database: isDatabaseConnected ? 'ok' : 'not connected',
    })
  }
}
