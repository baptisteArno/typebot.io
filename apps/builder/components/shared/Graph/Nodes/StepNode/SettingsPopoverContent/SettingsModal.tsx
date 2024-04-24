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
import { colors } from 'libs/theme'
import { StepType, WOZStepType } from 'models'
import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
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
    <Modal
      scrollBehavior="inside"
      isOpen={isOpen}
      onClose={onClose}
      size={stepType === WOZStepType.MESSAGE ? 'full' : 'xl'}
    >
      <ModalOverlay />
      <ModalContent
        onMouseDown={handleMouseDown}
        sx={{
          minHeight: '30vh',
          maxHeight: 'calc(100% - 68px)',
          margin: 'auto',
        }}
      >
        <ModalHeader>
          <HStack>
            <StepIcon type={stepType}></StepIcon>
            <Text fontSize={'16px'} fontStyle={'normal'} fontWeight={700}>
              <StepTypeLabel type={stepType}></StepTypeLabel>
            </Text>
            <ModalCloseButton />
          </HStack>
          <Text
            fontSize={'14px'}
            fontStyle={'normal'}
            fontWeight={400}
            lineHeight={'20px'}
          >
            <StepTypeHelper type={stepType}></StepTypeHelper>
          </Text>
        </ModalHeader>
        <ModalBody
          sx={{
            '&::-webkit-scrollbar': {
              width: '5px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.gray[300],
              borderRadius: '24px',
            },
          }}
          marginRight={0.5}
          {...props}
        >
          {props.children}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
