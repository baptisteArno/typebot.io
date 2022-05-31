import path from 'path'
import { migrateWorkspace } from './workspaceMigration'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
  ),
})

const main = async () => {
  await migrateWorkspace()
}

main().then()
