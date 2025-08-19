import { useTranslate } from "@tolgee/react";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  title?: string;
  confirmButtonLabel: string;
  confirmButtonColor?: "blue" | "red";
  onConfirm: () => Promise<unknown> | unknown;
  onClose: () => void;
};

export const ConfirmDialog = ({
  title,
  isOpen,
  confirmButtonLabel,
  confirmButtonColor = "red",
  children,
  onClose,
  onConfirm,
}: Props) => {
  const { t } = useTranslate();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const onConfirmClick = async () => {
    setConfirmLoading(true);
    try {
      await onConfirm();
    } catch (e) {
      setConfirmLoading(false);
      return setConfirmLoading(false);
    }
    setConfirmLoading(false);
    onClose();
  };

  return (
    <AlertDialog.Root isOpen={isOpen} onClose={onClose}>
      <AlertDialog.Popup initialFocus={cancelRef}>
        <AlertDialog.Title>
          {title ?? t("confirmModal.defaultTitle")}
        </AlertDialog.Title>
        {children}
        <AlertDialog.Footer>
          <AlertDialog.CloseButton variant="secondary" ref={cancelRef}>
            {t("cancel")}
          </AlertDialog.CloseButton>
          <Button
            variant={confirmButtonColor === "red" ? "destructive" : undefined}
            onClick={onConfirmClick}
            disabled={confirmLoading}
          >
            {confirmButtonLabel}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
};
