import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useRef, useState } from "react";
import type { AudienceCreateInputSchema } from "../core/Audience";
import { CreateAudienceForm } from "./CreateAudienceForm";

type Props = {
  onCreateSubmit: (input: AudienceCreateInputSchema) => Promise<void>;
};
export const EmptyAudiencesListForm = ({ onCreateSubmit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (input: AudienceCreateInputSchema) => {
    await onCreateSubmit(input);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>No audiences found</h2>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Create audience
      </Button>
      <Dialog.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Popup initialFocus={initialFocusRef}>
          <Dialog.Title>New audience</Dialog.Title>
          <Dialog.CloseButton />
          <CreateAudienceForm
            onValidSubmit={handleSubmit}
            initialFocusRef={initialFocusRef}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
};
