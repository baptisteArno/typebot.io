import type { ChangePlanModalProps } from "@/features/billing/components/ChangePlanModal";
import { ChangePlanModal } from "@/features/billing/components/ChangePlanModal";
import {
  Alert,
  AlertIcon,
  type AlertProps,
  HStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

type Props = AlertProps & Pick<ChangePlanModalProps, "type" | "excludedPlans">;

export const UnlockPlanAlertInfo = ({
  type,
  excludedPlans,
  ...props
}: Props) => {
  const { isOpen, onClose } = useDisclosure();
  return (
    <Alert
      status="info"
      rounded="md"
      justifyContent="space-between"
      flexShrink={0}
      {...props}
    >
      <HStack>
        <AlertIcon />
        <Text>{props.children}</Text>
      </HStack>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        excludedPlans={excludedPlans}
      />
    </Alert>
  );
};
