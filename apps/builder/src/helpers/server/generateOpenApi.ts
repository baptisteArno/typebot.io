import { generateOpenApiDocument } from 'trpc-openapi'
import { writeFileSync } from 'fs'
import { publicRouter } from './routers/publicRouter'

const openApiDocument = generateOpenApiDocument(publicRouter, {
  title: 'Builder API',
  version: '1.0.0',
  baseUrl: 'https://app.typebot.io/api',
  docsUrl: 'https://docs.typebot.io/api',
})

writeFileSync(
  './openapi/builder/_spec_.json',
  JSON.stringify(openApiDocument, null, 2)
)
