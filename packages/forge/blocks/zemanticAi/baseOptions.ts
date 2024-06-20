import { option } from '@sniper.io/forge'

export const baseOptions = option.object({
  projectId: option.string.layout({
    placeholder: 'Select a project',
    fetcher: 'fetchProjects',
  }),
})
