import { Button } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { useTypebotDnd } from '../TypebotDndProvider'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useTranslate } from '@tolgee/react'

export const BackButton = ({ id }: { id: string | null }) => {
  const { t } = useTranslate()
  const { draggedTypebot, setMouseOverFolderId, mouseOverFolderId } =
    useTypebotDnd()

  const isTypebotOver = useMemo(
    () => draggedTypebot && mouseOverFolderId === id,
    [draggedTypebot, id, mouseOverFolderId]
  )

  const handleMouseEnter = () => setMouseOverFolderId(id)
  const handleMouseLeave = () => setMouseOverFolderId(undefined)
  return (
    <Button
      as={Link}
      href={id ? `/typebots/folders/${id}` : '/typebots'}
      leftIcon={<ChevronLeftIcon />}
      variant={'outline'}
      colorScheme={isTypebotOver || draggedTypebot ? 'blue' : 'gray'}
      borderWidth={isTypebotOver ? '2px' : '1px'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {t('back')}
    </Button>
  )
}
