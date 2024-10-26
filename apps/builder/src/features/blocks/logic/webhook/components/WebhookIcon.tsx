import { featherIconsBaseProps } from "@/components/icons";
import { Icon, type IconProps, useColorModeValue } from "@chakra-ui/react";

export const WebhookIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 24 24"
    color={useColorModeValue("purple.500", "purple.300")}
    {...featherIconsBaseProps}
    {...props}
  >
    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
    <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
    <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
  </Icon>
);
