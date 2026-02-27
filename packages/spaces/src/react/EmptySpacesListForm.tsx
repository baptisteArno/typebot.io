import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useRef, useState } from "react";
import type { SpaceCreateInputSchema } from "../core/Space";
import { CreateSpaceForm } from "./CreateSpaceForm";

type Props = {
  onCreateSubmit: (input: SpaceCreateInputSchema) => Promise<void>;
};
export const EmptySpacesListForm = ({ onCreateSubmit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (input: SpaceCreateInputSchema) => {
    await onCreateSubmit(input);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>No spaces found</h2>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Create space
      </Button>
      <Dialog.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Popup initialFocus={initialFocusRef}>
          <Dialog.Title>New space</Dialog.Title>
          <Dialog.CloseButton />
          <CreateSpaceForm
            onValidSubmit={handleSubmit}
            initialFocusRef={initialFocusRef}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
};
