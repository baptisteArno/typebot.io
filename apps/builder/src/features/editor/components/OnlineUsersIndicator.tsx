import { UsersIcon } from '@/components/icons'
import { Badge, Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import {
  SocketOnlineData,
  SocketUser,
  useEditor,
} from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'

export const OnlineUsersIndicator = () => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()
  const { onlineData, isUserEditing } = useEditor()

  if (!typebot?.id || !onlineData || onlineData.count <= 1) {
    return null
  }

  const getUserDisplayName = (user: SocketUser) => {
    return `${user.name} (${user.email})`
  }

  function getTooltipLabel(onlineData: SocketOnlineData) {
    return (
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" fontWeight="semibold">
          {onlineData.count === 1
            ? t('editor.header.user.readonly.tooltip.onePersonViewing')
            : t('editor.header.user.readonly.tooltip.manyPeopleViewing')}{' '}
          {t('editor.header.user.readonly.tooltip.thisFlow')}
        </Text>

        {onlineData.users.map((user: SocketUser, index: number) => {
          const displayName = getUserDisplayName(user)
          const isEditor = index === 0

          return (
            <Text key={user.id} fontSize="xs" color="black">
              •{' '}
              {isEditor ? (
                <Text as="span" fontWeight="bold">
                  {displayName}{' '}
                  {t('editor.header.user.readonly.tooltip.editor')}
                </Text>
              ) : (
                displayName
              )}
            </Text>
          )
        })}
      </VStack>
    )
  }
  return (
    <Box alignItems="center" display="flex" gap={3}>
      {!isUserEditing && (
        <Badge
          colorScheme="orange"
          variant="solid"
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
        >
          {t('editor.header.user.readonly.badge.label')}
        </Badge>
      )}

      <Tooltip
        label={getTooltipLabel(onlineData)}
        hasArrow
        placement="bottom-start"
      >
        <HStack spacing={1}>
          <UsersIcon color="green.500" boxSize={4} />
          <Badge
            colorScheme="green"
            variant="subtle"
            size="sm"
            borderRadius="full"
          >
            <Text fontSize="xs" fontWeight="semibold">
              {onlineData.count}
            </Text>
          </Badge>
        </HStack>
      </Tooltip>
    </Box>
  )
}
