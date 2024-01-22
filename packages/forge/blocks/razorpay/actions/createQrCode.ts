import { createAction, option } from '@typebot.io/forge'
import { toBuffer as generateQrCodeBuffer } from 'qrcode'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { createId } from '@typebot.io/lib/createId'
import { auth } from '../auth'
import got from 'got'
import { apiBaseUrl } from '../constants'
import { baseOptions } from '../baseOptions'
import { convertToPaise } from '../lib/convertToPaise'

export const createQrCode = createAction({
  name: 'Generate a QR Code',
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
      moreInfoTooltip: 'Any unique id for the transaction'
    }),
    usage: option.enum(['single_use', 'multiple_use']).layout({
      accordion: 'Advanced Configuration',
      label: 'Usage',
      moreInfoTooltip: 'Will the qr code be used once or multiple times',
      defaultValue: 'single_use'
    }),
    fixed_amount: option.boolean.layout({
      accordion: 'Advanced Configuration',
      label: 'Fixed Amount',
      moreInfoTooltip: 'Is the amount fixed',
      defaultValue: true
    }),
    valid_till: option.string.layout({
      accordion: 'Advanced Configuration',
      label: 'Valid Till',
      moreInfoTooltip: 'How long is the QR code valid till (in seconds)',
      defaultValue: '900'
    }),
    saveUrlInVariableId: option.string.layout({
      label: 'Save QR code image URL',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!options.amount || !parseInt(options.amount))
        return logs.add(
          'Amount is empty. Please provide the amount to generate the QR code.'
        )
      if (!options.saveUrlInVariableId)
        return logs.add(
          'QR code image URL is not specified. Please select a variable to save the generated QR code image.'
        )
      if (!options.valid_till) options.valid_till = '900'

      const delta = parseInt(options.valid_till)
      const close_by = delta > 900 ? Math.floor(Date.now() / 1000) + delta : Math.floor(Date.now() / 1000) + 900
      const notes: Record<string, string> = {}
      notes[options.uidLabel ?? 'vdsid'] = options.uid ?? `${close_by}`
      try {
        const qrcode = {
          type: "upi_qr",
          name: options.companyName ?? 'QR Code',
          usage: options.usage ?? 'single_use',
          fixed_amount: options.fixed_amount ?? true,
          payment_amount: convertToPaise(options.amount),
          description: `For ${options.companyName ?? 'Payment'}`,
          close_by: close_by,
          notes: notes
        }

        const response: Record<string, string> = await got.post(`${apiBaseUrl}/payments/qr_codes`, {
          headers: {
            "Content-Type": "application/json"
          },
          username: options.keyId,
          password: credentials.keySecret,
          json: qrcode,
        }).json()

        const url = await uploadFileToBucket({
          file: await generateQrCodeBuffer(response.image_content),
          key: `tmp/qrcodes/${createId() + createId()}.png`,
          mimeType: 'image/png',
        })

        variables.set(options.saveUrlInVariableId, url)
      } catch (error) {
        return logs.add(error as string)
      }

    },
  },
})
