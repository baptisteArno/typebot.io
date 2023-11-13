import { generateOpenApiDocument } from 'trpc-openapi'
import { writeFileSync } from 'fs'
import { appRouter } from '@/helpers/server/appRouter'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Chat API',
  version: '3.0.0',
  baseUrl: 'https://typebot.io/api',
  docsUrl: 'https://docs.typebot.io/api',
})

writeFileSync(
  './openapi/chat/_spec_.json',
  JSON.stringify(openApiDocument, null, 2)
)
