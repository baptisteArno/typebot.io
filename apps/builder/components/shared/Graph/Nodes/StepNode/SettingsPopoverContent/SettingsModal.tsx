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
  Text,
} from '@chakra-ui/react'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepTypeHelper } from 'components/editor/StepsSideBar/StepTypeHelper'
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
        <ModalHeader>
          <HStack>
            <StepIcon type={stepType}></StepIcon>
            <Text fontSize={"16px"} fontStyle={"normal"} fontWeight={700}>
              <StepTypeLabel type={stepType}></StepTypeLabel>
            </Text>
            <ModalCloseButton />
          </HStack>
          <Text fontSize={"14px"} fontStyle={"normal"} fontWeight={400} lineHeight={"20px"}>
            <StepTypeHelper type={stepType}></StepTypeHelper>
          </Text>
        </ModalHeader>
        <ModalBody {...props}>{props.children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
