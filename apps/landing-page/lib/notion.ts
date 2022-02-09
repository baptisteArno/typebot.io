import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
})

export const getDatabase = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Created',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
  })
  return response.results
}

export const getFullDatabase = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Created',
        direction: 'descending',
      },
    ],
  })
  return response.results
}

export const getPage = async (databaseId: string, slug: string) => {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Slug',
      text: {
        equals: slug,
      },
    },
  })
  if (results.length === 0) return
  const page_id = results.pop()?.id
  if (!page_id) return
  const response = await notion.pages.retrieve({ page_id })
  return response
}

export const getBlocks = async (blockId: string) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  })
  return response.results
}
