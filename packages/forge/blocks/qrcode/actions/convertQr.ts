import { createAction, option } from "@typebot.io/forge";
import QRCode from 'qrcode'

export const convertQr = createAction({
  name: 'Convert Qr',
  options: option.object({
    qrvalue: option.string.layout({
      label: 'Data',
      isRequired: true,
      helperText: 'Data to convert into QR Code'
    }),
    saveQrcodeInVariableId: option.string.layout({
      label: 'QR Code',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveQrcodeInVariableId ? [options.saveQrcodeInVariableId] : [],
  run: {
    server: async ({ options, variables, logs }) => {
      if (!options.qrvalue) return logs.add('Qr code value is empty')
      if (!options.saveQrcodeInVariableId)
        return logs.add('Qr Code save variable is empty')

      let qrcode = ''
      try {
        qrcode = await QRCode.toDataURL(options.qrvalue)
      } catch (error) {
        return logs.add(`${error}`)
      }

      variables.set(options.saveQrcodeInVariableId, qrcode)
    },
  },
})
