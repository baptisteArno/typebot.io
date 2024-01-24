import { CopyIcon, TrashIcon } from '@/components/icons'
import { headerHeight } from '@/features/editor/constants'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  HStack,
  Button,
  IconButton,
  useColorModeValue,
  useEventListener,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { useGroupsStore } from '../hooks/useGroupsStore'
import { toast } from 'sonner'

type Props = {
  focusedGroups: string[]
  blurGroups: () => void
}

export const GroupSelectionMenu = ({ focusedGroups, blurGroups }: Props) => {
  const { typebot, deleteGroups } = useTypebot()
  const ref = useRef<HTMLDivElement>(null)
  const copyGroups = useGroupsStore((state) => state.copyGroups)

  useEventListener('pointerup', (e) => e.stopPropagation(), ref.current)

  const handleCopy = () => {
    if (!typebot) return
    const groups = typebot.groups.filter((g) => focusedGroups.includes(g.id))
    copyGroups(
      groups,
      typebot.edges.filter((edge) =>
        groups.find((g) => g.id === edge.to.groupId)
      )
    )
    toast('Groups copied to clipboard')
  }

  const handleDelete = () => {
    deleteGroups(focusedGroups)
    blurGroups()
  }

  useKeyboardShortcuts({
    copy: handleCopy,
    cut: () => {
      handleCopy()
      handleDelete()
    },
    backspace: handleDelete,
  })

  return (
    <HStack
      ref={ref}
      rounded="md"
      spacing={0}
      pos="fixed"
      top={`calc(${headerHeight}px + 20px)`}
      bgColor={useColorModeValue('white', 'gray.900')}
      zIndex={1}
      right="100px"
      shadow="lg"
    >
      <Button
        pointerEvents={'none'}
        color={useColorModeValue('blue.500', 'blue.200')}
        borderRightWidth="1px"
        borderRightRadius="none"
        bgColor={useColorModeValue('white', undefined)}
        size="sm"
      >
        {focusedGroups.length} selected
      </Button>
      <IconButton
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label="Copy"
        onClick={handleCopy}
        bgColor={useColorModeValue('white', undefined)}
        icon={<CopyIcon />}
        size="sm"
      />

      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        bgColor={useColorModeValue('white', undefined)}
        icon={<TrashIcon />}
        size="sm"
        onClick={handleDelete}
      />
    </HStack>
  )
}
