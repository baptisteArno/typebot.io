import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { CreateTableRecordResponse } from '../types'
import { ReduceKeyValueListToRecord } from '../helper'

export const createTableRecord = createAction({
  auth,
  name: 'Create Table Record',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to create records in.',
    }),
    records: option.keyValueList.layout({
      label: 'Record',
      helperText:
        'Record to create, where record is a set of key-value pairs representing field names and values.',
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
        const res: CreateTableRecordResponse = await got
          .post(`${apiEndpoint}/api/v2/tables/${tableId}/records`, {
            headers: {
              'Xc-Token': apiKey,
            },
            json: [ReduceKeyValueListToRecord(records)],
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
