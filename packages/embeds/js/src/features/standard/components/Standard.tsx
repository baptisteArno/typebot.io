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

export const Standard = (
  props: BotProps,
  { element }: { element: HTMLElement }
) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false)

  const launchBot = () => {
    setIsBotDisplayed(true)
  }

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting))
      launchBot()
  })

  onMount(() => {
    botLauncherObserver.observe(element)
  })

  onCleanup(() => {
    botLauncherObserver.disconnect()
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
