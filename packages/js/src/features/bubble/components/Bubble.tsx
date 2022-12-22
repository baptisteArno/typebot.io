import styles from '../../../assets/index.css'
import { createSignal } from 'solid-js'

export const Bubble = () => {
  const [isBotOpened, setIsBotOpened] = createSignal(false)

  const toggleBot = () => {
    setIsBotOpened(!isBotOpened())
  }

  return (
    <>
      <style>{styles}</style>
      <button
        onClick={toggleBot}
        class="bg-blue-500 text-red-300 absolute bottom-4 right-4 w-12 h-12 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 flex justify-center items-center"
      >
        <svg
          viewBox="0 0 24 24"
          style={{ transition: 'transform 200ms, opacity 200ms' }}
          class={
            'w-7 stroke-white stroke-2 fill-transparent absolute ' +
            (isBotOpened() ? 'scale-0 opacity-0' : 'scale-100 opacity-100')
          }
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          style={{ transition: 'transform 200ms, opacity 200ms' }}
          class={
            'w-7 fill-white absolute ' +
            (isBotOpened()
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-0 -rotate-180 opacity-0')
          }
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18.601 8.39897C18.269 8.06702 17.7309 8.06702 17.3989 8.39897L12 13.7979L6.60099 8.39897C6.26904 8.06702 5.73086 8.06702 5.39891 8.39897C5.06696 8.73091 5.06696 9.2691 5.39891 9.60105L11.3989 15.601C11.7309 15.933 12.269 15.933 12.601 15.601L18.601 9.60105C18.9329 9.2691 18.9329 8.73091 18.601 8.39897Z"
          />
        </svg>
      </button>
      <div
        style={{
          width: '400px',
          height: 'calc(100% - 104px)',
          'max-height': '704px',
          transition:
            'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
          'transform-origin': 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
        }}
        class={
          'absolute bottom-20 right-4 rounded-2xl ' +
          (isBotOpened() ? 'opacity-1' : 'opacity-0 pointer-events-none')
        }
      />
    </>
  )
}
