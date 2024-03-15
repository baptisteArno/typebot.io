import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { HTTPError, got } from 'got'
import { ListLinkedRecordsResponse } from '../types'
import { isDefined } from '@typebot.io/lib'

export const listLinkedRecords = createAction({
  auth,
  name: 'List Linked Records',
  options: option.object({
    tableId: option.string.layout({
      label: 'Table ID',
      isRequired: true,
      helperText: 'Identifier of the table to list linked records from.',
    }),
    linkFieldId: option.string.layout({
      label: 'Link Field ID',
      isRequired: true,
      helperText:
        'Identifier of the link field to retrieve linked records for.',
    }),
    recordId: option.string.layout({
      label: 'Record ID',
      isRequired: true,
      helperText: 'Identifier of the record to retrieve linked records for.',
    }),
    fields: option.string.layout({
      label: 'Fields',
      helperText:
        'Comma-separated list of fields to include from the linked records. Leave empty to include only the primary key and display value.',
    }),
    sort: option.string.layout({
      label: 'Sort',
      helperText:
        'Comma-separated list of fields to sort the linked records by. Prefix with "-" to sort in descending order.',
    }),
    where: option.string.layout({
      label: 'Where',
      helperText:
        'Conditions to filter linked records, e.g., (field1,eq,value1)~and(field2,eq,value2).',
      inputType: 'textarea',
    }),
    offset: option.number.layout({
      label: 'Offset',
      helperText:
        'Number of linked records to skip from the beginning of the result set.',
      defaultValue: 0,
    }),
    limit: option.number.layout({
      label: 'Limit',
      helperText: 'Maximum number of linked records to retrieve.',
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
        linkFieldId,
        recordId,
        fields,
        sort,
        where,
        offset,
        limit,
        responseMapping,
      },
      variables,
      logs,
    }) => {
      try {
        const res: ListLinkedRecordsResponse = await got
          .get(
            `${apiEndpoint}/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`,
            {
              headers: {
                'Xc-Token': apiKey,
              },
              searchParams: {
                fields,
                sort,
                where,
                offset: offset?.toString(),
                limit: limit?.toString(),
              },
            }
          )
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
