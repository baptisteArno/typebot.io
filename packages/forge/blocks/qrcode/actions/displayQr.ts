import { createAction, option } from "@typebot.io/forge";
import qrcode from "qrcode-generator";


export const displayQr = createAction({
  name: 'Display Qr',
  options: option.object({
    qrvalue: option.string.layout({
      label: 'Qr Code',
      helperText: 'QR code to show'
    }),
    qrlink: option.string.layout({
      label: 'Qr link',
      helperText: 'Link to goto on tapping QR code'
    }),
  }),
  run: {
    web: {
      displayEmbedBubble: {
        parseInitFunction: ({ options }) => {
          if (!options.qrvalue) throw new Error('Missing Qr Code')
          var qr = qrcode(8, 'L');
          qr.addData(options.qrvalue);
          qr.make();
          const qrvalue = qr.createDataURL();
          return {
            args: {
              qrvalue: qrvalue,
              qrlink: options.qrlink ?? null
            },
            content: `let qr = document.createElement("img");qr.src = qrvalue;qr.classList.add('w-full');; let link = document.createElement("a"); link.href = qrlink; link.target = '_blank'; link.appendChild(qr); typebotElement.appendChild(qrlink ? link : qr);`,
          }
        },
      },
    }
  },
})
