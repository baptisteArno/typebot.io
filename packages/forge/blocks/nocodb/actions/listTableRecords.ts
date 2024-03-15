import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { ListTableRecordsResponse } from '../types'
import { isDefined } from '@typebot.io/lib'

export const listTableRecords = createAction({
  auth,
  name: 'List Table Records',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to retrieve records from.',
    }),
    fields: option.string.layout({
      label: 'Fields',
      helperText:
        'Comma-separated list of fields to include in the response. Leave empty to include all fields.',
    }),
    sort: option.string.layout({
      label: 'Sort',
      helperText:
        'Comma-separated list of fields to sort the records by. Prefix with "-" to sort in descending order.',
    }),
    where: option.string.layout({
      label: 'Where',
      helperText:
        'Conditions to filter records, e.g., (field1,eq,value1)~and(field2,eq,value2).',
      inputType: 'textarea',
    }),
    offset: option.number.layout({
      label: 'Offset',
      helperText:
        'Number of records to skip from the beginning of the result set.',
      defaultValue: 0,
    }),
    limit: option.number.layout({
      label: 'Limit',
      helperText: 'Maximum number of records to retrieve.',
    }),
    viewId: option.string.layout({
      label: 'View ID',
      helperText: 'Identifier of the view to fetch records from.',
    }),
    responseMapping: option.saveResponseArray(['List', 'Page Info']).layout({
      accordion: 'Save response',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: {
        tableId,
        fields,
        sort,
        where,
        offset,
        limit,
        viewId,
        responseMapping,
      },
      variables,
      logs,
    }) => {
      try {
        const res: ListTableRecordsResponse = await got
          .get(`${apiEndpoint}/api/v2/tables/${tableId}/records`, {
            headers: {
              'Xc-Token': apiKey,
            },
            searchParams: {
              fields,
              sort,
              where,
              offset: offset?.toString(),
              limit: limit?.toString(),
              viewId,
            },
          })
          .json()

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          const item = mapping.item ?? 'List'
          if (item === 'List') variables.set(mapping.variableId, res.list)

          if (item === 'Page Info')
            variables.set(mapping.variableId, res.pageInfo)
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
