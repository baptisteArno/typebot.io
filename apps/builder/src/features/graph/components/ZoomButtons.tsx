import { MinusIcon, PlusIcon } from "@/components/icons";
import { IconButton, Stack, useColorModeValue } from "@chakra-ui/react";

type Props = {
  onZoomInClick: () => void;
  onZoomOutClick: () => void;
};
export const ZoomButtons = ({
  onZoomInClick: onZoomIn,
  onZoomOutClick: onZoomOut,
}: Props) => (
  <Stack
    bgColor={useColorModeValue("white", "gray.950")}
    rounded="md"
    spacing="0"
    shadow="md"
  >
    <IconButton
      icon={<PlusIcon />}
      aria-label={"Zoom in"}
      size="sm"
      onClick={onZoomIn}
      bgColor={useColorModeValue("white", undefined)}
      borderBottomRadius={0}
    />
    <IconButton
      icon={<MinusIcon />}
      aria-label={"Zoom out"}
      size="sm"
      onClick={onZoomOut}
      bgColor={useColorModeValue("white", undefined)}
      borderTopRadius={0}
    />
  </Stack>
);
