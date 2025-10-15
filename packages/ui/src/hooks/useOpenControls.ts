import { useState } from "react";

const defaultParams = {
  defaultIsOpen: false,
} as const;

type Params = {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export const useOpenControls = ({
  defaultIsOpen = defaultParams.defaultIsOpen,
  onOpen,
  onClose,
}: Params = defaultParams) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return {
    isOpen,
    onOpen: () => {
      setIsOpen(true);
      onOpen?.();
    },
    onClose: () => {
      setIsOpen(false);
      onClose?.();
    },
  };
};
