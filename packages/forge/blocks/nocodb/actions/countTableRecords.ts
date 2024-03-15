import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { CountTableRecordsResponse } from '../types'
import { isDefined } from '@typebot.io/lib'

export const countTableRecords = createAction({
  auth,
  name: 'Count Table Records',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to count records from.',
    }),
    viewId: option.string.layout({
      label: 'View ID',
      helperText: 'Identifier of the view to count records from.',
    }),
    where: option.string.layout({
      label: 'Where',
      helperText:
        'Conditions to filter records, e.g., (field1,eq,value1)~and(field2,eq,value2).',
      inputType: 'textarea',
    }),
    responseMapping: option.saveResponseArray(['Count']).layout({
      accordion: 'Save response',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: { tableId, viewId, where, responseMapping },
      variables,
      logs,
    }) => {
      try {
        const res: CountTableRecordsResponse = await got
          .get(`${apiEndpoint}/api/v2/tables/${tableId}/records/count`, {
            headers: {
              'Xc-Token': apiKey,
            },
            searchParams: {
              viewId,
              where,
            },
          })
          .json()

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          const item = mapping.item ?? 'Count'
          if (item === 'Count') variables.set(mapping.variableId, res.count)
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
