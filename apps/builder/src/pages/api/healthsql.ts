import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'
import logger from '@/helpers/logger'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    logger.error('Error accessing the database:', error)
    return false
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
      database: 'ok',
    })
  } else {
    res.status(500).json({
      status: 'error',
      database: 'not connected',
    })
  }
}
