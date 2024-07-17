import { onCleanup, onMount } from 'solid-js'
// import { SniperLogo } from './icons/SniperLogo'

type Props = {
  botContainer: HTMLDivElement | undefined
}

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined
  let observer: MutationObserver | undefined

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if (
          'id' in removedNode &&
          liteBadge &&
          removedNode.id == 'lite-badge'
        ) {
          console.log("Sorry, you can't remove the brand 😅")
          props.botContainer?.append(liteBadge)
        }
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
      href={'https://dev.qiplus.com.br/app'}
      target="_blank"
      rel="noopener noreferrer"
      class="lite-badge"
      id="lite-badge"
    >
      {/* TODO: Reabilitar ao criar um svg da QIPLUS */}
      {/* <SniperLogo /> */}
      <span>Made with Sniper QIPLUS</span>
    </a>
  )
}
