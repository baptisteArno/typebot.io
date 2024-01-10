import { createBlock } from '@typebot.io/forge'
import { QrcodeLogo } from './logo'
import { convertQr } from './actions/convertQr'

export const qrcode = createBlock({
  id: 'qrcode',
  name: 'QRcode',
  tags: ['QR Code'],
  LightLogo: QrcodeLogo,
  actions: [convertQr]
})
