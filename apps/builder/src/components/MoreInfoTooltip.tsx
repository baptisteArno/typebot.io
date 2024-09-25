import { Tooltip, chakra } from "@chakra-ui/react";
import { HelpCircleIcon } from "./icons";

type Props = {
  children: React.ReactNode;
};

export const MoreInfoTooltip = ({ children }: Props) => {
  return (
    <Tooltip label={children} hasArrow rounded="md" p="3" placement="top">
      <chakra.span cursor="pointer">
        <HelpCircleIcon />
      </chakra.span>
    </Tooltip>
  );
};
