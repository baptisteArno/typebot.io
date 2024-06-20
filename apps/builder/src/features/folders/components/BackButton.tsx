import { Button } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { useSniperDnd } from '../SniperDndProvider'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useTranslate } from '@tolgee/react'

export const BackButton = ({ id }: { id: string | null }) => {
  const { t } = useTranslate()
  const { draggedSniper, setMouseOverFolderId, mouseOverFolderId } =
    useSniperDnd()

  const isSniperOver = useMemo(
    () => draggedSniper && mouseOverFolderId === id,
    [draggedSniper, id, mouseOverFolderId]
  )

  const handleMouseEnter = () => setMouseOverFolderId(id)
  const handleMouseLeave = () => setMouseOverFolderId(undefined)
  return (
    <Button
      as={Link}
      href={id ? `/snipers/folders/${id}` : '/snipers'}
      leftIcon={<ChevronLeftIcon />}
      variant={'outline'}
      colorScheme={isSniperOver || draggedSniper ? 'blue' : 'gray'}
      borderWidth={isSniperOver ? '2px' : '1px'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {t('back')}
    </Button>
  )
}
