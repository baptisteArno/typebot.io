import styles from '../../../assets/index.css'
import { Bot, BotProps } from '@/components/Bot'
import { CommandData } from '@/features/commands/types'
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
    window.addEventListener('message', processIncomingEvent)
    botLauncherObserver.observe(element)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'unmount') setIsBotDisplayed(false)
  }

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
