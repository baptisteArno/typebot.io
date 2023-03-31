import { createSignal, Show } from 'solid-js'
import {
  ButtonTheme,
  PreviewMessageParams,
  PreviewMessageTheme,
} from '../types'

export type PreviewMessageProps = Pick<
  PreviewMessageParams,
  'avatarUrl' | 'message'
> & {
  buttonSize: ButtonTheme['size']
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
      part="preview-message"
      onClick={() => props.onClick()}
      class={
        'fixed right-5 max-w-[256px] rounded-md duration-200 flex items-center gap-4 shadow-md animate-fade-in cursor-pointer hover:shadow-lg p-4' +
        (props.buttonSize === 'large' ? ' bottom-24' : ' bottom-20')
      }
      style={{
        'background-color':
          props.previewMessageTheme?.backgroundColor ?? defaultBackgroundColor,
        color: props.previewMessageTheme?.textColor ?? defaultTextColor,
        'z-index': 42424242,
      }}
      onMouseEnter={() => setIsPreviewMessageHovered(true)}
      onMouseLeave={() => setIsPreviewMessageHovered(false)}
    >
      <CloseButton
        isHovered={isPreviewMessageHovered()}
        previewMessageTheme={props.previewMessageTheme}
        onClick={props.onCloseClick}
      />
      <Show when={props.avatarUrl} keyed>
        {(avatarUrl) => (
          <img
            src={avatarUrl}
            class="rounded-full w-8 h-8 object-cover"
            alt="Bot avatar"
          />
        )}
      </Show>
      <p>{props.message}</p>
    </div>
  )
}

const CloseButton = (props: {
  isHovered: boolean
  previewMessageTheme?: PreviewMessageTheme
  onClick: () => void
}) => (
  <button
    class={
      `absolute -top-2 -right-2 rounded-full w-6 h-6 p-1 hover:brightness-95 active:brightness-90 transition-all border ` +
      (props.isHovered ? 'opacity-100' : 'opacity-0')
    }
    onClick={(e) => {
      e.stopPropagation()
      return props.onClick()
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
)
