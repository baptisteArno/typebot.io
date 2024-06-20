import { generateOpenApiDocument } from '@lilyrose2798/trpc-openapi'
import { writeFileSync } from 'fs'
import { appRouter } from './appRouter'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Chat API',
  version: '3.0.0',
  baseUrl: 'https://sniper.io/api',
  docsUrl: 'https://docs.sniper.io/api-reference',
})

writeFileSync('./openapi/viewer.json', JSON.stringify(openApiDocument, null, 2))
