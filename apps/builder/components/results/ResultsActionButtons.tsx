import {
  HStack,
  Button,
  Fade,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from 'assets/icons'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import React from 'react'

type ResultsActionButtonsProps = {
  totalSelected: number
  isDeleteLoading: boolean
  isExportLoading: boolean
  onDeleteClick: () => Promise<void>
  onExportClick: () => void
}

export const ResultsActionButtons = ({
  totalSelected,
  isDeleteLoading,
  isExportLoading,
  onDeleteClick,
  onExportClick,
}: ResultsActionButtonsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <HStack>
      <Fade in={totalSelected > 0} unmountOnExit>
        <HStack
          as={Button}
          colorScheme="blue"
          onClick={onExportClick}
          isLoading={isExportLoading}
        >
          <DownloadIcon />
          <Text>Export</Text>

          <Tag colorScheme="blue" variant="subtle" size="sm">
            {totalSelected}
          </Tag>
        </HStack>
      </Fade>

      <Fade in={totalSelected > 0} unmountOnExit>
        <HStack
          as={Button}
          colorScheme="red"
          onClick={onOpen}
          isLoading={isDeleteLoading}
        >
          <TrashIcon />
          <Text>Deletar</Text>
          {totalSelected > 0 && (
            <Tag colorScheme="red" variant="subtle" size="sm">
              {totalSelected}
            </Tag>
          )}
        </HStack>
        <ConfirmModal
          isOpen={isOpen}
          onConfirm={onDeleteClick}
          onClose={onClose}
          message={
            <Text>
              You are about to delete{' '}
              <strong>
                {totalSelected} submission
                {totalSelected > 1 ? 's' : ''}
              </strong>
              . Are you sure you wish to continue?
            </Text>
          }
          confirmButtonLabel={'Delete'}
        />
      </Fade>
    </HStack>
  )
}
