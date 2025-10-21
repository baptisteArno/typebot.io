import { Globe02Icon } from "@typebot.io/ui/icons/Globe02Icon";
import { SourceCodeIcon } from "@typebot.io/ui/icons/SourceCodeIcon";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";

export const runtimes = [
  {
    name: "Web",
    icon: <Globe02Icon />,
  },
  {
    name: "WhatsApp",
    icon: <WhatsAppLogo />,
  },
  { name: "API", icon: <SourceCodeIcon /> },
] as const;
