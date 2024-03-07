import { Show } from 'solid-js'
import { isNotDefined, isSvgSrc } from '@typebot.io/lib'
import { BubbleTheme, ButtonTheme } from '../types'
import { isLight } from '@typebot.io/lib/hexToRgb'
import { clsx } from 'clsx'

type Props = Pick<BubbleTheme, 'placement'> &
  ButtonTheme & {
    isBotOpened: boolean
    toggleBot: () => void
    buttonSize: `${number}px`
  }

const defaultButtonColor = '#0042DA'
const defaultDarkIconColor = '#27272A'
const defaultLightIconColor = '#fff'

const isImageSrc = (src: string) =>
  src.startsWith('http') || src.startsWith('data:image/svg+xml')

export const BubbleButton = (props: Props) => (
  <button
    part="button"
    onClick={() => props.toggleBot()}
    class={clsx(
      `fixed bottom-5 shadow-md  rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 flex justify-center items-center animate-fade-in`,
      props.placement === 'left' ? ' left-5' : ' right-5'
    )}
    style={{
      'background-color': props.backgroundColor ?? defaultButtonColor,
      'z-index': 42424242,
      width: props.buttonSize,
      height: props.buttonSize,
    }}
    aria-label="Open chatbot"
  >
    <Show when={isNotDefined(props.customIconSrc)} keyed>
      <svg
        //@ts-expect-error part exists
        part="button-icon"
        viewBox="0 0 24 24"
        style={{
          stroke:
            props.iconColor ??
            (isLight(props.backgroundColor ?? defaultButtonColor)
              ? defaultDarkIconColor
              : defaultLightIconColor),
        }}
        class={clsx(
          'stroke-2 fill-transparent absolute duration-200 transition w-[60%]',
          props.isBotOpened ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </Show>
    <Show when={props.customIconSrc && isImageSrc(props.customIconSrc)}>
      <img
        part="button-icon"
        src={props.customIconSrc}
        class={clsx(
          'duration-200 transition',
          props.isBotOpened ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
          isSvgSrc(props.customIconSrc) ? 'w-[60%]' : 'w-full h-full',
          isSvgSrc(props.customIconSrc) ? '' : 'object-cover rounded-full'
        )}
        alt="Bubble button icon"
      />
    </Show>
    <Show when={props.customIconSrc && !isImageSrc(props.customIconSrc)}>
      <span
        part="button-icon"
        class={clsx(
          'text-4xl duration-200 transition',
          props.isBotOpened ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
        style={{
          'font-family':
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {props.customIconSrc}
      </span>
    </Show>
    <Show when={isNotDefined(props.customCloseIconSrc)}>
      <svg
        //@ts-expect-error part exists
        part="button-icon"
        viewBox="0 0 24 24"
        style={{
          fill:
            props.iconColor ??
            (isLight(props.backgroundColor ?? defaultButtonColor)
              ? defaultDarkIconColor
              : defaultLightIconColor),
        }}
        class={clsx(
          'absolute duration-200 transition w-[60%]',
          props.isBotOpened
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-180 opacity-0'
        )}
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18.601 8.39897C18.269 8.06702 17.7309 8.06702 17.3989 8.39897L12 13.7979L6.60099 8.39897C6.26904 8.06702 5.73086 8.06702 5.39891 8.39897C5.06696 8.73091 5.06696 9.2691 5.39891 9.60105L11.3989 15.601C11.7309 15.933 12.269 15.933 12.601 15.601L18.601 9.60105C18.9329 9.2691 18.9329 8.73091 18.601 8.39897Z"
        />
      </svg>
    </Show>
    <Show
      when={props.customCloseIconSrc && isImageSrc(props.customCloseIconSrc)}
    >
      <img
        part="button-icon"
        src={props.customCloseIconSrc}
        class={clsx(
          'absolute duration-200 transition',
          props.isBotOpened
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-180 opacity-0',
          isSvgSrc(props.customCloseIconSrc) ? 'w-[60%]' : 'w-full h-full',
          isSvgSrc(props.customCloseIconSrc) ? '' : 'object-cover rounded-full'
        )}
        alt="Bubble button close icon"
      />
    </Show>
    <Show
      when={props.customCloseIconSrc && !isImageSrc(props.customCloseIconSrc)}
    >
      <span
        part="button-icon"
        class={clsx(
          'absolute text-4xl duration-200 transition',
          props.isBotOpened
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-180 opacity-0'
        )}
        style={{
          'font-family':
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {props.customCloseIconSrc}
      </span>
    </Show>
  </button>
)
