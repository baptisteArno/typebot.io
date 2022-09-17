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
import { ChangePlanModal } from './modals/ChangePlanModal'
import { LimitReached } from './modals/ChangePlanModal'

export const Info = (props: AlertProps) => (
  <Alert status="info" bgColor={'blue.50'} rounded="md" {...props}>
    <AlertIcon />
    {props.children}
  </Alert>
)

export const PublishFirstInfo = (props: AlertProps) => (
  <Info {...props}>You need to publish your typebot first</Info>
)

export const UnlockPlanInfo = ({
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
