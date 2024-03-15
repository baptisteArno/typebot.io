import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { ReadTableRecordResponse } from '../types'
import { isDefined } from '@typebot.io/lib'

export const readTableRecord = createAction({
  auth,
  name: 'Read Table Record',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to read a record from.',
    }),
    recordId: option.string.layout({
      label: 'Record ID',
      isRequired: true,
      helperText: 'Identifier of the record to read.',
    }),
    fields: option.string.layout({
      label: 'Fields',
      helperText:
        'Comma-separated list of fields to include in the response. Leave empty to include all fields.',
    }),
    responseMapping: option.saveResponseArray(['Record']).layout({
      accordion: 'Save response',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: { tableId, recordId, fields, responseMapping },
      variables,
      logs,
    }) => {
      try {
        const res: ReadTableRecordResponse = await got
          .get(`${apiEndpoint}/api/v2/tables/${tableId}/records/${recordId}`, {
            headers: {
              'Xc-Token': apiKey,
            },
            searchParams: {
              fields,
            },
          })
          .json()

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          const item = mapping.item ?? 'Record'
          if (item === 'Record') variables.set(mapping.variableId, res)
        })
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
