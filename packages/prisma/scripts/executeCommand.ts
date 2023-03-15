import { exec } from 'child_process'
import { join } from 'path'

require('dotenv').config({
  override: true,
  path: join(__dirname, `../.env`),
})

const postgesqlSchemaPath = join(__dirname, '../postgresql/schema.prisma')
const mysqlSchemaPath = join(__dirname, '../mysql/schema.prisma')

type Options = {
  force?: boolean
}

export const executePrismaCommand = (command: string, options?: Options) => {
  const databaseUrl =
    process.env.DATABASE_URL ?? (options?.force ? 'postgresql://' : undefined)

  if (!databaseUrl) {
    console.error('Could not find DATABASE_URL in environment')
    return
  }

  if (databaseUrl?.startsWith('mysql://')) {
    console.log('Executing for MySQL schema')
    executeCommand(`${command} --schema ${mysqlSchemaPath}`)
  }

  if (databaseUrl?.startsWith('postgresql://')) {
    console.log('Executing for PostgreSQL schema')
    executeCommand(`${command} --schema ${postgesqlSchemaPath}`)
  }
}

const executeCommand = (command: string) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(error.message)
      return
    }
    if (stderr) {
      console.log(stderr)
      return
    }
    console.log(stdout)
  })
}
