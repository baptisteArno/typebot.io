import { Icon, type IconProps } from "@chakra-ui/icon";
import { defaultIconProps } from "./constants";

export const ArrowUpRightIcon = (props: IconProps) => (
  <Icon {...defaultIconProps} {...props}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </Icon>
);
