import { UserPreferencesForm } from "@/features/user/components/UserPreferencesForm";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const EditorSettingsDialog = ({ isOpen, onClose }: Props) => (
  <Dialog.Root isOpen={isOpen} onClose={onClose}>
    <Dialog.Popup className="max-w-2xl">
      <Dialog.CloseButton />
      <UserPreferencesForm />
    </Dialog.Popup>
  </Dialog.Root>
);
