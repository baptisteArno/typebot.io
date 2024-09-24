import { LockedIcon } from "@/components/icons";
import { Tag, type TagProps } from "@chakra-ui/react";
import type { Plan } from "@typebot.io/prisma/enum";
import { planColorSchemes } from "./PlanTag";

export const LockTag = ({ plan, ...props }: { plan?: Plan } & TagProps) => (
  <Tag
    colorScheme={plan ? planColorSchemes[plan] : "gray"}
    data-testid={`${plan?.toLowerCase()}-lock-tag`}
    {...props}
  >
    <LockedIcon />
  </Tag>
);
