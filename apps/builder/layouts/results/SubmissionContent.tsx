import {
  Button,
  HStack,
  Stack,
  Tag,
  useToast,
  Text,
  Fade,
  Flex,
  useDisclosure,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from 'assets/icons'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { SubmissionsTable } from 'components/results/SubmissionsTable'
import React, { useMemo, useState } from 'react'
import { deleteResults, useResults } from 'services/results'

type Props = { typebotId: string; totalResults: number }
export const SubmissionsContent = ({ typebotId, totalResults }: Props) => {
  const [lastResultId, setLastResultId] = useState<string>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { results, mutate } = useResults({
    lastResultId,
    typebotId,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })

  const handleNewSelection = (newSelection: string[]) => {
    if (newSelection.length === selectedIds.length) return
    setSelectedIds(newSelection)
  }

  const handleDeleteSelection = async () => {
    setIsDeleteLoading(true)
    const { error } = await deleteResults(typebotId, selectedIds)
    if (error) toast({ description: error.message, title: error.name })
    else
      mutate({
        results: (results ?? []).filter((result) =>
          selectedIds.includes(result.id)
        ),
      })
    setIsDeleteLoading(false)
  }

  const totalSelected = useMemo(
    () =>
      selectedIds.length === results?.length
        ? totalResults
        : selectedIds.length,
    [results?.length, selectedIds.length, totalResults]
  )

  return (
    <Stack maxW="1200px" w="full">
      <Flex w="full" justifyContent="flex-end">
        <HStack>
          <HStack as={Button} colorScheme="blue">
            <DownloadIcon />
            <Text>Export</Text>
            <Fade
              in={totalSelected > 0 && (results ?? []).length > 0}
              unmountOnExit
            >
              <Tag colorScheme="blue" variant="subtle" size="sm">
                {totalSelected}
              </Tag>
            </Fade>
          </HStack>
          <Fade in={totalSelected > 0} unmountOnExit>
            <HStack
              as={Button}
              colorScheme="red"
              onClick={onOpen}
              isLoading={isDeleteLoading}
            >
              <TrashIcon />
              <Text>Delete</Text>
              {totalSelected > 0 && (
                <Tag colorScheme="red" variant="subtle" size="sm">
                  {totalSelected}
                </Tag>
              )}
              <ConfirmModal
                isOpen={isOpen}
                onConfirm={handleDeleteSelection}
                onClose={onClose}
                message={
                  <Text>
                    You are about to delete{' '}
                    <strong>
                      {totalSelected} submission
                      {totalSelected > 0 ? 's' : ''}
                    </strong>
                    . Are you sure you wish to continue?
                  </Text>
                }
                confirmButtonLabel={'Delete'}
              />
            </HStack>
          </Fade>
        </HStack>
      </Flex>

      <SubmissionsTable results={results} onNewSelection={handleNewSelection} />
    </Stack>
  )
}
