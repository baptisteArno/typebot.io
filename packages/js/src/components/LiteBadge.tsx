import { onCleanup, onMount } from 'solid-js'

type Props = {
  botContainer: HTMLDivElement | undefined
}

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined
  let observer: MutationObserver | undefined

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if ('id' in removedNode && liteBadge && removedNode.id == 'lite-badge')
          props.botContainer?.append(liteBadge)
      })
    })
  }

  onMount(() => {
    if (!document || !props.botContainer) return
    observer = new MutationObserver(appendBadgeIfNecessary)
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
      class="absolute py-1 px-2 bg-white z-50 rounded shadow-md lite-badge text-gray-900"
      style={{ bottom: '20px' }}
      id="lite-badge"
    >
      Made with <span class="text-blue-500">Typebot</span>.
    </a>
  )
}
