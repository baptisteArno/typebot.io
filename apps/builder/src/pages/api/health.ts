import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTypebotViewer() {
  try {
    const response = await fetch('http://localhost:3001')
    return response.status === 200
  } catch (error) {
    console.error('Error accessing Typebot Viewer:', error)
    return false
  }
}

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
  const isViewerResponsive = await checkTypebotViewer()
  const isDatabaseConnected = await checkDatabaseConnection()

  if (isViewerResponsive && isDatabaseConnected) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      viewer: isViewerResponsive ? 'ok' : 'not responsive',
      database: isDatabaseConnected ? 'ok' : 'not connected',
    })
  } else {
    res.status(500).json({
      status: 'error',
      test: 'builder',
      viewer: isViewerResponsive ? 'ok' : 'not responsive',
      database: isDatabaseConnected ? 'ok' : 'not connected',
    })
  }
}
