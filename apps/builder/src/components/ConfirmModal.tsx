import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { useRef, useState } from "react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onConfirm: () => Promise<unknown> | unknown;
  onClose: () => void;
  message: JSX.Element;
  title?: string;
  confirmButtonLabel: string;
  confirmButtonColor?: "blue" | "red";
};

export const ConfirmModal = ({
  title,
  message,
  isOpen,
  onClose,
  confirmButtonLabel,
  onConfirm,
  confirmButtonColor = "red",
}: ConfirmDeleteModalProps) => {
  const { t } = useTranslate();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const cancelRef = useRef(null);

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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title ?? t("confirmModal.defaultTitle")}
          </AlertDialogHeader>

          <AlertDialogBody>{message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              colorScheme={confirmButtonColor}
              onClick={onConfirmClick}
              ml={3}
              isLoading={confirmLoading}
            >
              {confirmButtonLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
