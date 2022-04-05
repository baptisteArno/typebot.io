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
import { UpgradeModal } from './modals/UpgradeModal'
import { LimitReached } from './modals/UpgradeModal/UpgradeModal'

export const Info = (props: AlertProps) => (
  <Alert status="info" bgColor={'blue.50'} rounded="md" {...props}>
    <AlertIcon />
    {props.children}
  </Alert>
)

export const PublishFirstInfo = (props: AlertProps) => (
  <Info {...props}>You need to publish your typebot first</Info>
)

export const UnlockProPlanInfo = ({
  contentLabel,
  buttonLabel,
  type,
}: {
  contentLabel: string
  buttonLabel: string
  type?: LimitReached
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Alert
      status="info"
      bgColor={'blue.50'}
      rounded="md"
      justifyContent="space-between"
    >
      <HStack>
        <AlertIcon />
        <Text>{contentLabel}</Text>
      </HStack>
      <Button colorScheme="blue" onClick={onOpen}>
        {buttonLabel}
      </Button>
      <UpgradeModal isOpen={isOpen} onClose={onClose} type={type} />
    </Alert>
  )
}
