import { createBlock } from '@typebot.io/forge'
import { NocodbLogo } from './logo'
import { auth } from './auth'
import { listTableRecords } from './actions/listTableRecords'
import { createTableRecord } from './actions/createTableRecord'
import { updateTableRecord } from './actions/updateTableRecord'
import { deleteTableRecords } from './actions/deleteTableRecords'
import { readTableRecord } from './actions/readTableRecord'
import { countTableRecords } from './actions/countTableRecords'
import { listLinkedRecords } from './actions/listLinkedRecords'
import { linkRecords } from './actions/linkRecords'
import { unlinkRecords } from './actions/unlinkRecords'

export const nocodb = createBlock({
  id: 'nocodb',
  name: 'NocoDB',
  tags: ['database'],
  LightLogo: NocodbLogo,
  auth,
  actions: [
    listTableRecords,
    createTableRecord,
    updateTableRecord,
    deleteTableRecords,
    readTableRecord,
    countTableRecords,
    listLinkedRecords,
    linkRecords,
    unlinkRecords,
  ],
})
