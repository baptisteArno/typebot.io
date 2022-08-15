import { FullConfig } from '@playwright/test'
// import { setupDatabase, teardownDatabase } from './services/database'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env' })

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  if (!baseURL) throw new Error('baseURL is missing')
  // await teardownDatabase()
  // await setupDatabase()
}

export default globalSetup
