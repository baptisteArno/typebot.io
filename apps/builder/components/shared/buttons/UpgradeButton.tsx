import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { UpgradeModal } from '../modals/UpgradeModal'
import { LimitReached } from '../modals/UpgradeModal/UpgradeModal'

type Props = { type?: LimitReached } & ButtonProps

export const UpgradeButton = ({ type, ...props }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Button colorScheme="blue" {...props} onClick={onOpen}>
      {props.children ?? 'Upgrade'}
      <UpgradeModal isOpen={isOpen} onClose={onClose} type={type} />
    </Button>
  )
}
