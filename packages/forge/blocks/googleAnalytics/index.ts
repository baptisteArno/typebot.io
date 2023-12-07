import { createBlock } from '@typebot.io/forge'
import { GoogleAnalyticsLogo } from './logo'
import { trackEvent } from './actions/trackEvent'
import { baseOptions } from './baseOptions'

export const googleAnalytics = createBlock({
  id: 'google-analytics',
  name: 'Analytics',
  fullName: 'Google Analytics',
  tags: ['google', 'analytics', 'tracking', 'events'],
  LightLogo: GoogleAnalyticsLogo,
  options: baseOptions,
  isDisabledInPreview: true,
  run: {
    web: {
      parseInitFunction: ({ options: { measurementId } }) => {
        if (!measurementId) return
        return {
          args: {
            measurementId,
          },
          content: `if (window.gtag) return Promise.resolve()
            await new Promise((resolve) => {
              const existingScript = document.getElementById('gtag')
              if (!existingScript) {
                const script = document.createElement('script')
                script.src = \`https://www.googletagmanager.com/gtag/js?id=\$\{measurementId\}\`
                script.id = 'gtag'
                const initScript = document.createElement('script')
                initScript.innerHTML = \`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
              
                gtag('config', measurementId);
                \`
                document.body.appendChild(script)
                document.body.appendChild(initScript)
                script.onload = () => {
                  resolve()
                }
              }
              if (existingScript) resolve()
            })`,
        }
      },
    },
  },
  actions: [trackEvent],
})
