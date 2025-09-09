import {
  Alert,
  AlertIcon,
  type AlertProps,
  HStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import type { ChangePlanDialogProps } from "@/features/billing/components/ChangePlanDialog";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";

type Props = AlertProps & Pick<ChangePlanDialogProps, "type" | "excludedPlans">;

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
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        excludedPlans={excludedPlans}
      />
    </Alert>
  );
};
