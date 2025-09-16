import { UsersIcon } from '@/components/icons'
import { Badge, Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { useEditor } from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { TypebotEditQueueItem } from '../hooks/useEditQueue'

export const OnlineUsersIndicator = () => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()
  const { queueItems, isUserEditing } = useEditor()

  if (!typebot?.id || !queueItems || queueItems.length <= 1) {
    return null
  }

  function getTooltipLabel(queueItems: TypebotEditQueueItem[]) {
    return (
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" fontWeight="semibold">
          {queueItems.length === 1
            ? t('editor.header.user.readonly.tooltip.onePersonViewing')
            : t('editor.header.user.readonly.tooltip.manyPeopleViewing')}{' '}
          {t('editor.header.user.readonly.tooltip.thisFlow')}
        </Text>

        {queueItems.map(({ userId, user }, index: number) => {
          const displayName = `${user.name} (${user.email})`
          const isEditor = index === 0

          return (
            <Text key={userId} fontSize="xs" color="black">
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
    <Box alignItems="center" display="flex" gap={3} marginRight={2}>
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
        label={getTooltipLabel(queueItems)}
        placement="bottom-end"
        marginTop={2}
      >
        <HStack spacing={1}>
          <UsersIcon color="green.500" boxSize={4} />
          <Badge
            colorScheme="green"
            variant="subtle"
            size="sm"
            borderRadius="full"
            width={4}
            height={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" fontWeight="semibold">
              {queueItems.length}
            </Text>
          </Badge>
        </HStack>
      </Tooltip>
    </Box>
  )
}
