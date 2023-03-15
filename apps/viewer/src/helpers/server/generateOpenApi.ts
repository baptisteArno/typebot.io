import { generateOpenApiDocument } from 'trpc-openapi'
import { writeFileSync } from 'fs'
import { appRouter } from './routers/v1/_app'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Chat API',
  version: '1.0.0',
  baseUrl: 'https://typebot.io/api/v1',
  docsUrl: 'https://docs.typebot.io/api',
})

writeFileSync(
  './openapi/chat/_spec_.json',
  JSON.stringify(openApiDocument, null, 2)
)
