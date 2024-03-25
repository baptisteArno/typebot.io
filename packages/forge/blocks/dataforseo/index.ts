import { createBlock } from '@typebot.io/forge'
import {
  DataForSeoLogo as LightLogo,
  DataForSeoLogoDark as DarkLogo,
} from './logo'
import { auth } from './auth'
import { getSearchVolumeData } from './actions/getSearchVolumeData'
import { getSerpData } from './actions/getSerpData'
import { getKeywordSuggestions } from './actions/getKeywordSuggestions'

export const dataforseoBlock = createBlock({
  id: 'dataforseo',
  name: 'DataForSEO',
  tags: ['SEO', 'Data', 'Keywords', 'SERP'],
  LightLogo,
  DarkLogo,
  auth,
  actions: [getSearchVolumeData, getSerpData, getKeywordSuggestions],
})
