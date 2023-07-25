import dynamic from 'next/dynamic'

export const Standard = dynamic(
  () => import('@typebot.io/react/src/Standard'),
  { ssr: false }
)

export const Popup = dynamic(() => import('@typebot.io/react/src/Popup'), {
  ssr: false,
})

export const Bubble = dynamic(() => import('@typebot.io/react/src/Bubble'), {
  ssr: false,
})

export * from '@typebot.io/js'
