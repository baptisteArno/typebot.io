import { createBlock } from '@typebot.io/forge'
import { QrCodeLogo } from './logo'
import { generateQrCode } from './actions/generateQrCodeImage'

export const qrCode = createBlock({
  id: 'qr-code',
  name: 'QR code',
  tags: [],
  fullName:
    'Generate QR codes for efficient information dissemination and quick access',
  LightLogo: QrCodeLogo,
  actions: [generateQrCode],
})
