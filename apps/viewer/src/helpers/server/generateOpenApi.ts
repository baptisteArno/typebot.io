import { generateOpenApiDocument } from 'trpc-openapi'
import { writeFileSync } from 'fs'
import { appRouter } from './routers/appRouterV2'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Chat API',
  version: '2.0.0',
  baseUrl: 'https://typebot.io/api/v2',
  docsUrl: 'https://docs.typebot.io/api',
})

writeFileSync(
  './openapi/chat/_spec_.json',
  JSON.stringify(openApiDocument, null, 2)
)
