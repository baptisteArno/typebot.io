import { Dialog } from "@ark-ui/solid/dialog";
import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { useBotContainer } from "@/contexts/BotContainerContext";
import { CloseIcon } from "./icons/CloseIcon";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  children: JSX.Element;
};
export const Modal = (props: Props) => (
  <Dialog.Root
    open={props.isOpen}
    lazyMount
    unmountOnExit
    onOpenChange={props.onClose}
  >
    {/* Ideally we would want to mount it on the parent's body but Tailwind classes are (potentially) not defined there. */}
    <Portal mount={useBotContainer()()}>
      <Dialog.Backdrop class="absolute inset-0 bg-[rgba(0,0,0,0.8)] h-screen z-50" />
      <Dialog.Positioner class="absolute inset-0 z-50 flex items-center justify-center px-2">
        <Dialog.Content class="focus:outline-none">
          {props.children}
        </Dialog.Content>
        <Dialog.CloseTrigger class="fixed top-4 right-4 z-50 rounded-md bg-[#202020] p-2 text-white">
          <CloseIcon class="w-6 h-6" />
        </Dialog.CloseTrigger>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);
