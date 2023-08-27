import { exec } from 'child_process'
import { join, relative } from 'path'

const postgesqlSchemaPath = relative(
  process.cwd(),
  join(__dirname, `../postgresql/schema.prisma`)
)

const mysqlSchemaPath = relative(
  process.cwd(),
  join(__dirname, `../mysql/schema.prisma`)
)

type Options = {
  force?: boolean
}

export const executePrismaCommand = (command: string, options?: Options) => {
  const databaseUrl =
    process.env.DATABASE_URL ?? (options?.force ? 'postgresql://' : undefined)

  if (!databaseUrl) {
    console.error('Could not find DATABASE_URL in environment')
    process.exit(1)
  }

  if (databaseUrl?.startsWith('mysql://')) {
    console.log('Executing for MySQL schema')
    executeCommand(`${command} --schema ${mysqlSchemaPath}`)
  }

  if (databaseUrl?.startsWith('postgres')) {
    console.log('Executing for PostgreSQL schema')
    executeCommand(`${command} --schema ${postgesqlSchemaPath}`)
  }

  if (process.env.DATABASE_URL?.startsWith('postgres://')) {
    console.error('PostgreSQL `DATABASE_URL` should start with postgres')
    process.exit(1)
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
