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
      if (!options.qrvalue) return logs.add('QR code value is empty. Please provide the data to be encoded into the QR code.')
      if (!options.saveQrcodeInVariableId)
        return logs.add('QR Code save variable is not specified. Please select a variable to save the generated QR code.')

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
