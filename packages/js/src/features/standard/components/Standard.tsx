import styles from '../../../assets/index.css'
import { Bot, BotProps } from '@/components/Bot'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`

export const Standard = (props: BotProps) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false)

  const launchBot = () => {
    setIsBotDisplayed(true)
  }

  const observer = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting))
      launchBot()
  })

  onMount(() => {
    const standardElement = document.querySelector('typebot-standard')
    if (!standardElement) return
    observer.observe(standardElement)
  })

  onCleanup(() => {
    observer.disconnect()
  })

  return (
    <>
      <style>
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...props} />
      </Show>
    </>
  )
}
