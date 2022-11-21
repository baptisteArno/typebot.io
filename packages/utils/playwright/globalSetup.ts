import { FullConfig } from '@playwright/test'
import { setupDatabase, teardownDatabase } from './databaseSetup'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  if (!baseURL) throw new Error('baseURL is missing')
  await teardownDatabase()
  await setupDatabase()
}

export default globalSetup
