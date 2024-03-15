import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { UpdateTableRecordResponse } from '../types'
import { ReduceKeyValueListToRecord } from '../helper'

export const updateTableRecord = createAction({
  auth,
  name: 'Update Table Record',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to update records in.',
    }),
    records: option.keyValueList.layout({
      label: 'Records',
      helperText:
        'List of records to update, where each record is a set of key-value pairs representing field names and values. The "Id" field is required to identify the record to update.',
      isRequired: true,
    }),
  }),
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: { tableId, records },
      variables,
      logs,
    }) => {
      try {
        if (!records || records.length === 0) return

        console.log(records)
        let json: any = ReduceKeyValueListToRecord(records)
        console.log(json)

        const res: UpdateTableRecordResponse = await got
          .patch(`${apiEndpoint}/api/v2/tables/${tableId}/records`, {
            headers: {
              'Xc-Token': apiKey,
            },
            json: [json],
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
