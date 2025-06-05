import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { Portal } from "@ark-ui/react";
import { Dialog } from "@ark-ui/react/dialog";
import { dialogClassNames } from "@typebot.io/ui/components/Dialog";
import type React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const SettingsModal = ({ isOpen, onClose, children }: Props) => {
  const { ref } = useParentModal();
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => (e.open ? undefined : onClose())}
    >
      <Portal>
        <Dialog.Backdrop className={dialogClassNames.backdrop} />
        <Dialog.Positioner className={dialogClassNames.positioner}>
          <Dialog.Content className={dialogClassNames.content} ref={ref}>
            {children}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
