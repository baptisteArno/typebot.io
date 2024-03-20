import { createBlock } from '@typebot.io/forge'
import {
  DataForSeoLogo as LightLogo,
  DataForSeoLogoDark as DarkLogo,
} from './logo'
import { auth } from './auth'
import { getKeywordData } from '../dataforseo/actions/getKeywordData'

export const dataforseoBlock = createBlock({
  id: 'dataforseo',
  name: 'DataForSEO',
  tags: ['SEO', 'Data', 'Keywords'],
  LightLogo,
  DarkLogo,
  auth,
  actions: [getKeywordData],
})
