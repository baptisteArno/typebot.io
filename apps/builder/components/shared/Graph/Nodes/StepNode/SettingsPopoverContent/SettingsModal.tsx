import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalBodyProps,
  HStack,
} from '@chakra-ui/react'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepTypeLabel } from 'components/editor/StepsSideBar/StepTypeLabel'
import { StepType } from 'models'
import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void,
  stepType: StepType
}

export const SettingsModal = ({
  isOpen,
  onClose,
  stepType,
  ...props
}: Props & ModalBodyProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
      <ModalOverlay />
      <ModalContent onMouseDown={handleMouseDown}>
        <ModalHeader mb="2" borderBottomColor={"black"} borderBottomWidth={0.5}>
          <HStack>
            <StepIcon type={stepType}></StepIcon>
            <StepTypeLabel type={stepType}></StepTypeLabel>
            <ModalCloseButton />
          </HStack>
        </ModalHeader>
        <ModalBody {...props}>{props.children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
