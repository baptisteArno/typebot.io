import { MoreHorizontalIcon, EditIcon, TrashIcon } from '@/components/icons'
import { colors } from '@/lib/theme'
import { trpc } from '@/lib/trpc'
import {
  Stack,
  HStack,
  Flex,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Box,
  Text,
  Image,
  useColorModeValue,
} from '@chakra-ui/react'
import { BackgroundType, ThemeTemplate } from '@typebot.io/schemas'
import { useState } from 'react'
import { DefaultAvatar } from './DefaultAvatar'

export const ThemeTemplateCard = ({
  workspaceId,
  themeTemplate,
  isSelected,
  onClick,
  onRenameClick,
  onDeleteSuccess,
}: {
  workspaceId: string
  themeTemplate: Pick<ThemeTemplate, 'name' | 'theme' | 'id'>
  isSelected: boolean
  onRenameClick?: () => void
  onClick: () => void
  onDeleteSuccess?: () => void
}) => {
  const borderWidth = useColorModeValue(undefined, '1px')
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    theme: {
      listThemeTemplates: { refetch: refetchThemeTemplates },
    },
  } = trpc.useContext()
  const { mutate } = trpc.theme.deleteThemeTemplate.useMutation({
    onMutate: () => setIsDeleting(true),
    onSettled: () => setIsDeleting(false),
    onSuccess: () => {
      refetchThemeTemplates()
      if (onDeleteSuccess) onDeleteSuccess()
    },
  })

  const deleteThemeTemplate = () => {
    mutate({ themeTemplateId: themeTemplate.id, workspaceId })
  }

  const rounded =
    themeTemplate.theme.chat.roundness === 'large'
      ? 'md'
      : themeTemplate.theme.chat.roundness === 'none'
      ? 'none'
      : 'sm'

  return (
    <Stack
      borderWidth={borderWidth}
      cursor="pointer"
      onClick={onClick}
      spacing={0}
      opacity={isDeleting ? 0.5 : 1}
      pointerEvents={isDeleting ? 'none' : undefined}
      rounded="md"
      boxShadow={
        isSelected
          ? `${colors['blue']['400']} 0 0 0 4px`
          : `rgba(0, 0, 0, 0.08) 0px 2px 4px`
      }
      style={{
        willChange: 'box-shadow',
        transition: 'box-shadow 0.2s ease 0s',
      }}
    >
      <Box
        borderTopRadius="md"
        backgroundSize="cover"
        {...parseBackground(themeTemplate.theme.general.background)}
        borderColor={isSelected ? 'blue.400' : undefined}
      >
        <HStack mt="4" ml="4" spacing={0.5} alignItems="flex-end">
          <AvatarPreview avatar={themeTemplate.theme.chat.hostAvatar} />
          <Box
            rounded="sm"
            w="80px"
            h="16px"
            background={themeTemplate.theme.chat.hostBubbles.backgroundColor}
          />
        </HStack>

        <HStack
          mt="1"
          mr="4"
          ml="auto"
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          <Box
            rounded="sm"
            w="80px"
            h="16px"
            background={themeTemplate.theme.chat.guestBubbles.backgroundColor}
          />
          <AvatarPreview avatar={themeTemplate.theme.chat.guestAvatar} />
        </HStack>

        <HStack mt="1" ml="4" spacing={0.5} alignItems="flex-end">
          <AvatarPreview avatar={themeTemplate.theme.chat.hostAvatar} />
          <Box
            rounded="sm"
            w="80px"
            h="16px"
            background={themeTemplate.theme.chat.hostBubbles.backgroundColor}
          />
        </HStack>
        <Flex
          mt="1"
          mb="4"
          pr="4"
          ml="auto"
          w="full"
          justifyContent="flex-end"
          gap="1"
        >
          <Box
            rounded={rounded}
            w="20px"
            h="10px"
            background={themeTemplate.theme.chat.buttons.backgroundColor}
          />
          <Box
            rounded={rounded}
            w="20px"
            h="10px"
            background={themeTemplate.theme.chat.buttons.backgroundColor}
          />
          <Box
            rounded={rounded}
            w="20px"
            h="10px"
            background={themeTemplate.theme.chat.buttons.backgroundColor}
          />
        </Flex>
      </Box>
      <HStack p="2" justifyContent="space-between">
        <Text fontSize="sm" noOfLines={1}>
          {themeTemplate.name}
        </Text>
        {onDeleteSuccess && onRenameClick && (
          <Menu isLazy>
            <MenuButton
              as={IconButton}
              icon={<MoreHorizontalIcon />}
              aria-label="Open template menu"
              variant="ghost"
              size="xs"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList onClick={(e) => e.stopPropagation()}>
              {isSelected && (
                <MenuItem icon={<EditIcon />} onClick={onRenameClick}>
                  Rename
                </MenuItem>
              )}
              <MenuItem
                icon={<TrashIcon />}
                color="red.500"
                onClick={deleteThemeTemplate}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Stack>
  )
}

const parseBackground = (background: {
  type: BackgroundType
  content?: string
}) => {
  switch (background.type) {
    case BackgroundType.COLOR:
      return {
        backgroundColor: background.content,
      }
    case BackgroundType.IMAGE:
      return { backgroundImage: `url(${background.content})` }
    case BackgroundType.NONE:
      return
  }
}

const AvatarPreview = ({
  avatar,
}: {
  avatar:
    | {
        isEnabled: boolean
        url?: string | undefined
      }
    | undefined
}) => {
  if (!avatar?.isEnabled) return null
  return avatar.url ? (
    <Image
      src={avatar.url}
      alt="Avatar preview in theme template card"
      boxSize="12px"
      rounded="full"
    />
  ) : (
    <DefaultAvatar boxSize="12px" />
  )
}
