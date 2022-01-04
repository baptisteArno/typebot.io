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
import React, { useCallback, useMemo, useState } from 'react'
import { deleteAllResults, deleteResults, useResults } from 'services/results'

type Props = {
  typebotId: string
  totalResults: number
  onDeleteResults: (total: number) => void
}
export const SubmissionsContent = ({
  typebotId,
  totalResults,
  onDeleteResults,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { data, mutate, setSize, hasMore } = useResults({
    typebotId,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })

  const results = useMemo(() => data?.flatMap((d) => d.results), [data])

  const handleNewSelection = (newSelection: string[]) => {
    if (newSelection.length === selectedIds.length) return
    setSelectedIds(newSelection)
  }

  const handleDeleteSelection = async () => {
    setIsDeleteLoading(true)
    const { error } =
      totalSelected === totalResults
        ? await deleteAllResults(typebotId)
        : await deleteResults(typebotId, selectedIds)
    if (error) toast({ description: error.message, title: error.name })
    else {
      mutate(
        totalSelected === totalResults
          ? []
          : data?.map((d) => ({
              results: d.results.filter((r) => !selectedIds.includes(r.id)),
            }))
      )
      onDeleteResults(totalSelected)
    }
    setIsDeleteLoading(false)
  }

  const totalSelected = useMemo(
    () =>
      selectedIds.length === results?.length
        ? totalResults
        : selectedIds.length,
    [results?.length, selectedIds.length, totalResults]
  )

  const handleScrolledToBottom = useCallback(
    () => setSize((state) => state + 1),
    [setSize]
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
            </HStack>
            <ConfirmModal
              isOpen={isOpen}
              onConfirm={handleDeleteSelection}
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
      </Flex>

      <SubmissionsTable
        results={results}
        onNewSelection={handleNewSelection}
        onScrollToBottom={handleScrolledToBottom}
        hasMore={hasMore}
      />
    </Stack>
  )
}
