import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import got from 'got'
import { apiBaseUrl, defaultCurrency, defaultUidLabel } from '../constants'
import { baseOptions } from '../baseOptions'
import { convertToPaise } from '../lib/convertToPaise'

export const createOrder = createAction({
  name: 'Payment Order',
  auth,
  baseOptions,
  options: option.object({
    amount: option.string.layout({
      label: 'Amount',
      moreInfoTooltip: 'Amount to be paid',
      isRequired: true
    }),
    uid: option.string.layout({
      label: 'Transaction ID',
      moreInfoTooltip: 'Any unique id for the transaction',
      isRequired: true
    }),
    saveOrderInVariableId: option.string.layout({
      label: 'Save Order ID',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveOrderInVariableId ? [options.saveOrderInVariableId] : [],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!options.amount || !parseInt(options.amount))
        return logs.add(
          'Amount is empty. Please provide the amount to generate the Order.'
        )
      if (!options.uid)
        return logs.add(
          'Transaction ID is empty. You can use any unique id for the transaction id.'
        )
      if (!options.saveOrderInVariableId)
        return logs.add(
          'Order ID variable is not specified. Please select a variable to save the generated order id.'
        )

      try {
        const notes: Record<string, string> = {}
        notes[options.uidLabel ?? defaultUidLabel] = options.uid ?? ''
        const order = {
          currency: options.currency ?? defaultCurrency,
          amount: convertToPaise(options.amount),
          receipt: options.uid ?? '',
          notes: notes
        }

        const response: Record<string, string> = await got.post(`${apiBaseUrl}/orders`, {
          headers: {
            "Content-Type": "application/json"
          },
          username: options.keyId,
          password: credentials.keySecret,
          json: order,
        }).json()

        variables.set(options.saveOrderInVariableId, response.id)
      } catch (error) {
        console.log(error)
        return logs.add('Error creating order')
      }

    },
  },
})
