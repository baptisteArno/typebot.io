import {
  Button,
  HStack,
  Stack,
  Tag,
  useToast,
  Text,
  Fade,
  Flex,
} from '@chakra-ui/react'
import { DownloadIcon, TrashIcon } from 'assets/icons'
import { SubmissionsTable } from 'components/results/SubmissionsTable'
import React, { useMemo, useState } from 'react'
import { useResults } from 'services/results'

type Props = { typebotId: string; totalResults: number }
export const SubmissionsContent = ({ typebotId, totalResults }: Props) => {
  const [lastResultId, setLastResultId] = useState<string>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { results } = useResults({
    lastResultId,
    typebotId,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })

  const handleNewSelection = (newSelection: string[]) => {
    if (newSelection.length === selectedIds.length) return
    setSelectedIds(newSelection)
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
            <Fade in={totalSelected > 0} unmountOnExit>
              <Tag colorScheme="blue" variant="subtle" size="sm">
                {totalSelected}
              </Tag>
            </Fade>
          </HStack>
          <Fade in={totalSelected > 0} unmountOnExit>
            <HStack as={Button} colorScheme="red">
              <TrashIcon />
              <Text>Delete</Text>
              {totalSelected > 0 && (
                <Tag colorScheme="red" variant="subtle" size="sm">
                  {totalSelected}
                </Tag>
              )}
            </HStack>
          </Fade>
        </HStack>
      </Flex>

      <SubmissionsTable results={results} onNewSelection={handleNewSelection} />
    </Stack>
  )
}
