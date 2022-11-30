import { generateOpenApiDocument } from 'trpc-openapi'
import { writeFileSync } from 'fs'
import { trpcRouter } from './routers/v1/trpcRouter'

const openApiDocument = generateOpenApiDocument(trpcRouter, {
  title: 'Builder API',
  version: '1.0.0',
  baseUrl: 'https://app.typebot.io/api/v1',
  docsUrl: 'https://docs.typebot.io/api',
})

writeFileSync(
  './openapi/builder/_spec_.json',
  JSON.stringify(openApiDocument, null, 2)
)
