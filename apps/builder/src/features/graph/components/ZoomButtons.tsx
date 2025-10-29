import { Button } from "@typebot.io/ui/components/Button";
import { MinusSignIcon } from "@typebot.io/ui/icons/MinusSignIcon";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";

type Props = {
  onZoomInClick: () => void;
  onZoomOutClick: () => void;
};
export const ZoomButtons = ({
  onZoomInClick: onZoomIn,
  onZoomOutClick: onZoomOut,
}: Props) => (
  <div className="flex flex-col gap-0 shadow-md rounded-md">
    <Button
      aria-label={"Zoom in"}
      size="icon"
      onClick={onZoomIn}
      className="rounded-b-none size-8 bg-gray-1"
      variant="ghost"
    >
      <PlusSignIcon />
    </Button>
    <Button
      aria-label={"Zoom out"}
      size="icon"
      onClick={onZoomOut}
      className="rounded-t-none size-8 bg-gray-1"
      variant="ghost"
    >
      <MinusSignIcon />
    </Button>
  </div>
);
