import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { DeleteTableRecordsResponse } from '../types'

export const deleteTableRecords = createAction({
  auth,
  name: 'Delete Table Records',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to delete records from.',
    }),
    recordIds: option.keyValueList.layout({
      label: 'Record IDs',
      helperText: 'List of record IDs to delete.',
      isRequired: true,
    }),
  }),
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: { tableId, recordIds },
      variables,
      logs,
    }) => {
      try {
        if (!recordIds || recordIds.length === 0) return

        const res: DeleteTableRecordsResponse = await got
          .delete(`${apiEndpoint}/api/v2/tables/${tableId}/records`, {
            headers: {
              'Xc-Token': apiKey,
            },
            json: recordIds.map((recordId) => ({ Id: recordId.value })),
          })
          .json()
      } catch (error) {
        if (error instanceof HTTPError)
          return logs.add({
            status: 'error',
            description: error.message,
            details: error.response.body,
          })
        console.error(error)
      }
    },
  },
})
