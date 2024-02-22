import { createBlock } from '@typebot.io/forge'
import { QrCodeLogo } from './logo'
import { generateQrCode } from './actions/generateQrCodeImage'

export const qrCode = createBlock({
  id: 'qr-code',
  name: 'QR code',
  tags: [],
  LightLogo: QrCodeLogo,
  actions: [generateQrCode],
})
