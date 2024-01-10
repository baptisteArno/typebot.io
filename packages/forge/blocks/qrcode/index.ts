import { createBlock } from '@typebot.io/forge'
import { QrcodeLogo } from './logo'
import { displayQr } from './actions/displayQr'

export const qrcode = createBlock({
  id: 'qrcode',
  name: 'QRcode',
  tags: ['QR Code', 'Scan'],
  LightLogo: QrcodeLogo,
  actions: [displayQr]
})
