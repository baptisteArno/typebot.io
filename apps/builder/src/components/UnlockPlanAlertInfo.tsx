import {
  Alert,
  AlertIcon,
  AlertProps,
  Button,
  HStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'
import {
  ChangePlanModal,
  ChangePlanModalProps,
} from '@/features/billing/components/ChangePlanModal'
import { useI18n } from '@/locales'

type Props = {
  buttonLabel?: string
} & AlertProps &
  Pick<ChangePlanModalProps, 'type' | 'excludedPlans'>

export const UnlockPlanAlertInfo = ({
  buttonLabel,
  type,
  excludedPlans,
  ...props
}: Props) => {
  const t = useI18n()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      <Button
        colorScheme={props.status === 'warning' ? 'orange' : 'blue'}
        onClick={onOpen}
        flexShrink={0}
        ml="2"
      >
        {buttonLabel ?? t('billing.upgradeAlert.buttonDefaultLabel')}
      </Button>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        excludedPlans={excludedPlans}
      />
    </Alert>
  )
}
