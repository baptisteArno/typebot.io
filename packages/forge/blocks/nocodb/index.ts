import { createBlock } from '@typebot.io/forge'
import { NocodbLogo } from './logo'
import { auth } from './auth'
import { searchRecords } from './actions/searchRecords'
import { createRecord } from './actions/createRecord'
import { updateExistingRecord } from './actions/updateExistingRecord'

export const nocodbBlock = createBlock({
  id: 'nocodb',
  name: 'NocoDB',
  docsUrl: 'https://docs.typebot.io/forge/blocks/nocodb',
  tags: ['database'],
  LightLogo: NocodbLogo,
  auth,
  actions: [searchRecords, createRecord, updateExistingRecord],
  onboarding: {
    youtubeId: 'ViKETDQ8Sfg',
    deployedAt: new Date('2023-06-20'),
  },
})
