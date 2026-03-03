import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useRef, useState } from "react";
import type { SegmentCreateInputSchema } from "../core/Segment";
import { CreateSegmentForm } from "./CreateSegmentForm";

type Props = {
  onCreateSubmit: (input: SegmentCreateInputSchema) => Promise<void>;
};
export const EmptySegmentsListForm = ({ onCreateSubmit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (input: SegmentCreateInputSchema) => {
    await onCreateSubmit(input);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>No segments found</h2>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Create segment
      </Button>
      <Dialog.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Popup initialFocus={initialFocusRef}>
          <Dialog.Title>New segment</Dialog.Title>
          <Dialog.CloseButton />
          <CreateSegmentForm
            onValidSubmit={handleSubmit}
            initialFocusRef={initialFocusRef}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
};
