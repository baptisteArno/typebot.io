import { PixelBlock } from '@typebot.io/schemas'

declare const window: {
  fbq?: (
    arg1: string,
    arg2: string,
    arg3: Record<string, string> | undefined
  ) => void
}

export const initPixel = (pixelId: string) => {
  const script = document.createElement('script')
  script.innerHTML = `!function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');`
  document.head.appendChild(script)

  const noscript = document.createElement('noscript')
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`
  document.head.appendChild(noscript)
}

export const trackPixelEvent = (options: PixelBlock['options']) => {
  if (!options.eventType || !options.pixelId) return
  if (!window.fbq) {
    console.error('Facebook Pixel was not properly initialized')
    return
  }
  const params = options.params?.length
    ? options.params.reduce<Record<string, string>>((obj, param) => {
        if (!param.key || !param.value) return obj
        return { ...obj, [param.key]: param.value }
      }, {})
    : undefined
  if (options.eventType === 'Custom') {
    if (!options.name) return
    window.fbq('trackCustom', options.name, params)
  }
  window.fbq('track', options.eventType, params)
}
