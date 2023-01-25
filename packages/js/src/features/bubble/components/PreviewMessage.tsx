import { createSignal } from 'solid-js'
import { PreviewMessageParams, PreviewMessageTheme } from '../types'

export type PreviewMessageProps = Pick<
  PreviewMessageParams,
  'avatarUrl' | 'message'
> & {
  previewMessageTheme?: PreviewMessageTheme
  onClick: () => void
  onCloseClick: () => void
}

const defaultBackgroundColor = '#F7F8FF'
const defaultTextColor = '#303235'

export const PreviewMessage = (props: PreviewMessageProps) => {
  const [isPreviewMessageHovered, setIsPreviewMessageHovered] =
    createSignal(false)

  return (
    <div
      // eslint-disable-next-line solid/reactivity
      onClick={props.onClick}
      class="absolute bottom-20 right-4 w-64 rounded-md duration-200 flex items-center gap-4 shadow-md animate-fade-in cursor-pointer hover:shadow-lg p-4"
      style={{
        'background-color':
          props.previewMessageTheme?.backgroundColor ?? defaultBackgroundColor,
        color: props.previewMessageTheme?.textColor ?? defaultTextColor,
      }}
      onMouseEnter={() => setIsPreviewMessageHovered(true)}
      onMouseLeave={() => setIsPreviewMessageHovered(false)}
    >
      <button
        class={
          `absolute -top-3 -right-3 rounded-full w-6 h-6 p-1 hover:brightness-95 active:brightness-90 transition-all ` +
          (isPreviewMessageHovered() ? 'opacity-100' : 'opacity-0')
        }
        onClick={(e) => {
          e.stopPropagation()
          return props.onCloseClick()
        }}
        style={{
          'background-color':
            props.previewMessageTheme?.closeButtonBackgroundColor ??
            defaultBackgroundColor,
          color:
            props.previewMessageTheme?.closeButtonIconColor ?? defaultTextColor,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={props.avatarUrl}
        class="rounded-full w-8 h-8 object-cover"
        alt="Bot avatar"
      />
      <p>{props.message}</p>
    </div>
  )
}
