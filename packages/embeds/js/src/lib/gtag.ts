import { isDefined, isEmpty } from '@typebot.io/lib/utils'
import { GoogleAnalyticsBlock } from '@typebot.io/schemas'

declare const window: {
  gtag?: (
    type: string,
    action: string | undefined,
    options: {
      event_category: string | undefined
      event_label: string | undefined
      value: number | undefined
      send_to: string | undefined
    }
  ) => void
}

export const initGoogleAnalytics = (id: string): Promise<void> => {
  if (isDefined(window.gtag)) return Promise.resolve()
  return new Promise((resolve) => {
    const existingScript = document.getElementById('gtag')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      script.id = 'gtag'
      const initScript = document.createElement('script')
      initScript.innerHTML = `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', '${id}');
      `
      document.body.appendChild(script)
      document.body.appendChild(initScript)
      script.onload = () => {
        resolve()
      }
    }
    if (existingScript) resolve()
  })
}

export const sendGaEvent = (options: GoogleAnalyticsBlock['options']) => {
  if (!options) return
  if (!window.gtag) {
    console.error('Google Analytics was not properly initialized')
    return
  }
  window.gtag('event', options.action, {
    event_category: isEmpty(options.category) ? undefined : options.category,
    event_label: isEmpty(options.label) ? undefined : options.label,
    value: options.value as number,
    send_to: isEmpty(options.sendTo) ? undefined : options.sendTo,
  })
}
