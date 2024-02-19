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
    return
  }

  if (databaseUrl?.startsWith('mysql://')) {
    console.log('Executing for MySQL schema')
    return executeCommand(`${command} --schema ${mysqlSchemaPath}`)
  }

  if (
    databaseUrl?.startsWith('postgres://') ||
    databaseUrl?.startsWith('postgresql://')
  ) {
    console.log('Executing for PostgreSQL schema')
    return executeCommand(`${command} --schema ${postgesqlSchemaPath}`)
  }

  console.error(
    'Invalid `DATABASE_URL` format, it should start with `postgresql://` or `postgres://`'
  )
  process.exit(1)
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
