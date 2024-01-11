import { createAction, option } from '@typebot.io/forge'
import { toBuffer as generateQrCodeBuffer } from 'qrcode'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { createId } from '@typebot.io/lib/createId'

export const generateQrCode = createAction({
  name: 'Generate a QR Code',
  options: option.object({
    data: option.string.layout({
      label: 'Data',
      helperText:
        'This can be a URL, or any text data you want to encode into a QR code.',
    }),
    saveUrlInVariableId: option.string.layout({
      label: 'Save QR code image URL',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
  run: {
    server: async ({ options, variables, logs }) => {
      if (!options.data)
        return logs.add(
          'QR code data is empty. Please provide the data to be encoded into the QR code.'
        )
      if (!options.saveUrlInVariableId)
        return logs.add(
          'QR code image URL is not specified. Please select a variable to save the generated QR code image.'
        )

      const url = await uploadFileToBucket({
        file: await generateQrCodeBuffer(options.data),
        key: `tmp/qrcodes/${createId() + createId()}.png`,
        mimeType: 'image/png',
      })

      variables.set(options.saveUrlInVariableId, url)
    },
  },
})
