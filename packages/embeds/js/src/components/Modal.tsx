import { Dialog } from '@ark-ui/solid'
import { JSX } from 'solid-js'
import { CloseIcon } from './icons/CloseIcon'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  children: JSX.Element
}
export const Modal = (props: Props) => {
  return (
    <Dialog.Root
      open={props.isOpen}
      lazyMount
      unmountOnExit
      onOpenChange={(e) => (!e.open ? props.onClose?.() : undefined)}
    >
      <Dialog.Backdrop class="fixed inset-0 bg-[rgba(0,0,0,0.5)] h-screen z-50" />
      <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center px-2">
        <Dialog.Content>{props.children}</Dialog.Content>
        <Dialog.CloseTrigger class="fixed top-2 right-2 z-50 rounded-md bg-white p-2 text-black">
          <CloseIcon class="w-6 h-6" />
        </Dialog.CloseTrigger>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
