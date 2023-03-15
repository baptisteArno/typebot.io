import type { GoogleAnalyticsOptions } from '@typebot.io/schemas'

declare const gtag: (
  type: string,
  action: string | undefined,
  options: {
    event_category: string | undefined
    event_label: string | undefined
    value: number | undefined
  }
) => void

const initGoogleAnalytics = (id: string): Promise<void> =>
  new Promise((resolve) => {
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

export const sendGaEvent = (options: GoogleAnalyticsOptions) => {
  if (!options) return
  gtag('event', options.action, {
    event_category: options.category,
    event_label: options.label,
    value: options.value,
  })
}

export default initGoogleAnalytics
