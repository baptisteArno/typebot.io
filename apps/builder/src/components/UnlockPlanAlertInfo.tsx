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
import { ChangePlanModal, LimitReached } from '@/features/billing'

export const UnlockPlanAlertInfo = ({
  contentLabel,
  buttonLabel = 'More info',
  type,
  ...props
}: {
  contentLabel: React.ReactNode
  buttonLabel?: string
  type?: LimitReached
} & AlertProps) => {
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
        <Text>{contentLabel}</Text>
      </HStack>
      <Button
        colorScheme={props.status === 'warning' ? 'orange' : 'blue'}
        onClick={onOpen}
        flexShrink={0}
        ml="2"
      >
        {buttonLabel}
      </Button>
      <ChangePlanModal isOpen={isOpen} onClose={onClose} type={type} />
    </Alert>
  )
}
