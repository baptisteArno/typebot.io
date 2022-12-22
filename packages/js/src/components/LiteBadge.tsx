import { onCleanup, onMount } from 'solid-js'

type Props = {
  botContainer: HTMLDivElement | undefined
}

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined
  let observer: MutationObserver | undefined

  onMount(() => {
    if (!document || !props.botContainer) return
    observer = new MutationObserver(function (mutations_list) {
      mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
          if (
            'id' in removed_node &&
            liteBadge &&
            removed_node.id == 'lite-badge'
          )
            props.botContainer?.append(liteBadge)
        })
      })
    })
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    })
  })

  onCleanup(() => {
    if (observer) observer.disconnect()
  })

  return (
    <a
      ref={liteBadge}
      href={'https://www.typebot.io/?utm_source=litebadge'}
      target="_blank"
      rel="noopener noreferrer"
      class="fixed py-1 px-2 bg-white z-50 rounded shadow-md lite-badge"
      style={{ bottom: '20px' }}
      id="lite-badge"
    >
      Made with <span class="text-blue-500">Typebot</span>.
    </a>
  )
}
