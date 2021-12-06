import { Button } from '@chakra-ui/react'
import { useDroppable } from '@dnd-kit/core'
import { ChevronLeftIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import React from 'react'

export const BackButton = ({ id }: { id: string | null }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id?.toString() ?? 'root',
  })
  return (
    <Button
      as={NextChakraLink}
      href={id ? `/typebots/folders/${id}` : '/typebots'}
      leftIcon={<ChevronLeftIcon />}
      variant={'outline'}
      colorScheme={isOver ? 'blue' : 'gray'}
      borderWidth={isOver ? '3px' : '1px'}
      ref={setNodeRef}
    >
      Back
    </Button>
  )
}
