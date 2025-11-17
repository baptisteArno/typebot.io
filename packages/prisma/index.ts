import { PrismaClient } from '@prisma/client'
export * from '@prisma/client'

// Named export for enums to avoid vite barrel export bug (https://github.com/nrwl/nx/issues/13704)
export {
  Plan,
  WorkspaceRole,
  GraphNavigation,
  CollaborationType,
} from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaInstance =
  global.prisma ||
  new PrismaClient({
    log: ['warn', 'error'], // evite 'query' em prod
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prismaInstance

export const prisma: PrismaClient = prismaInstance
