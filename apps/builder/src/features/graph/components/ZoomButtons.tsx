import { Stack } from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import { MinusIcon, PlusIcon } from "@/components/icons";

type Props = {
  onZoomInClick: () => void;
  onZoomOutClick: () => void;
};
export const ZoomButtons = ({
  onZoomInClick: onZoomIn,
  onZoomOutClick: onZoomOut,
}: Props) => (
  <Stack spacing="0" shadow="md" rounded="md">
    <Button
      aria-label={"Zoom in"}
      size="icon"
      onClick={onZoomIn}
      className="rounded-b-none size-8 bg-gray-1"
      variant="ghost"
    >
      <PlusIcon />
    </Button>
    <Button
      aria-label={"Zoom out"}
      size="icon"
      onClick={onZoomOut}
      className="rounded-t-none size-8 bg-gray-1"
      variant="ghost"
    >
      <MinusIcon />
    </Button>
  </Stack>
);
