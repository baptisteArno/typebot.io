import { createBlock } from '@typebot.io/forge'
import { ZemanticAiLogo } from './logo'
import ky from 'ky'
import { searchDocuments } from './actions/searchDocuments'
import { auth } from './auth'
import { baseOptions } from './baseOptions'

export const zemanticAiBlock = createBlock({
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
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey) return []

        const url = 'https://api.zemantic.ai/v1/projects'

        const response = await ky
          .get(url, {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
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
