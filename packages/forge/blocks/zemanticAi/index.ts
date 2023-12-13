import { createBlock } from '@typebot.io/forge'
import { ZemanticAiLogo } from './logo'
import { got } from 'got'
import { searchDocuments } from './actions/searchDocuments'
import { auth } from './auth'
import { baseOptions } from './baseOptions'

export const zemanticAi = createBlock({
  id: 'zemantic-ai',
  name: 'Zemantic AI',
  tags: [],
  LightLogo: ZemanticAiLogo,
  auth,
  options: baseOptions,
  fetchers: [
    {
      id: 'fetchProjects',
      dependencies: [],
      fetch: async ({ credentials: { apiKey } }) => {
        const url = 'https://api.zemantic.ai/v1/projects'

        const response = await got
          .get(url, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          })
          .json()

        const projectsData = response as {
          id: string
          name: string
        }[]

        return projectsData.map((project) => ({
          label: project.name,
          value: project.id,
        }))
      },
    },
  ],
  actions: [searchDocuments],
})
