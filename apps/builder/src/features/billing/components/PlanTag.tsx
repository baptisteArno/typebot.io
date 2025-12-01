import { Plan } from "@typebot.io/prisma/enum";
import { Badge } from "@typebot.io/ui/components/Badge";
import type { JSX } from "react";

export const PlanBadge = ({
  plan,
  className,
}: {
  plan: Plan;
  className?: string;
}): JSX.Element => {
  switch (plan) {
    case Plan.LIFETIME: {
      return (
        <Badge colorScheme="purple" className={className}>
          Lifetime
        </Badge>
      );
    }
    case Plan.PRO: {
      return (
        <Badge colorScheme="purple" className={className}>
          Pro
        </Badge>
      );
    }
    case Plan.OFFERED:
    case Plan.STARTER: {
      return (
        <Badge colorScheme="orange" className={className}>
          Starter
        </Badge>
      );
    }
    case Plan.FREE: {
      return <Badge className={className}>Free</Badge>;
    }
    case Plan.CUSTOM: {
      return (
        <Badge colorScheme="yellow" className={className}>
          Custom
        </Badge>
      );
    }
    case Plan.UNLIMITED: {
      return (
        <Badge colorScheme="yellow" className={className}>
          Unlimited
        </Badge>
      );
    }
    case Plan.ENTERPRISE: {
      return (
        <Badge colorScheme="yellow" className={className}>
          Enterprise
        </Badge>
      );
    }
  }
};
