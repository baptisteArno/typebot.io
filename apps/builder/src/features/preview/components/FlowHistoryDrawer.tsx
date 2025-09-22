import { CopyIcon, HistoryIcon } from '@/components/icons'
import { ConfirmModal } from '@/components/ConfirmModal'
import {
  Avatar,
  CloseButton,
  Fade,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useDrag } from '@use-gesture/react'
import { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR, enUS, es, fr, de, ro, it } from 'date-fns/locale'
import { headerHeight } from '../../editor/constants'
import { useTypebot } from '../../editor/providers/TypebotProvider'
import { useTypebotHistoryInfinite } from '../hooks/useTypebotHistory'

import {
  parseTypebotHistory,
  TypebotHistory,
} from '@typebot.io/schemas/features/typebot/typebotHistory'

import { ResizeHandle } from './ResizeHandle'

import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { useTranslate, useTolgee } from '@tolgee/react'
import { TypebotHistoryOrigin } from '@typebot.io/prisma'

const localeMap = {
  'pt-BR': ptBR,
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ro: ro,
  it: it,
} as const

const TimeAgo = ({ date }: { date: string }) => {
  const { getLanguage } = useTolgee()
  const currentLanguage = getLanguage()
  const locale = localeMap[currentLanguage as keyof typeof localeMap] || enUS

  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleString(currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Tooltip label={formattedDate} placement="top">
      <Text as="span">
        {formatDistanceToNowStrict(dateObj, { addSuffix: true, locale })}
      </Text>
    </Tooltip>
  )
}

type Props = {
  onClose: () => void
}

export const FlowHistoryDrawer = ({ onClose }: Props) => {
  const { t } = useTranslate()
  const { showToast } = useToast()

  const { typebot, rollbackTypebot } = useTypebot()
  const {
    data: historyPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTypebotHistoryInfinite(typebot?.id)

  // Flatten pages data
  const historyData = historyPages?.pages[0]
  const allHistory = historyPages?.pages.flatMap((page) => page.history) || []

  const summaryBgColor = useColorModeValue('blue.50', 'blue.900')
  const summaryBorderColor = useColorModeValue('blue.200', 'blue.700')
  const summaryTitleColor = useColorModeValue('blue.800', 'blue.200')
  const summaryTextColor = useColorModeValue('blue.600', 'blue.300')

  const getBadgeColorScheme = (origin: TypebotHistoryOrigin) => {
    switch (origin.toLowerCase()) {
      case 'publish':
        return 'green'
      case 'restore':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getOriginLabel = (origin: string) => {
    return t(`preview.flowHistory.origin.${origin.toLowerCase()}`, {
      defaultValue: origin,
    })
  }

  const countBlocks = (groups: unknown[] | null): number => {
    if (!groups) return 0
    return groups.reduce((total: number, group) => {
      return (
        total +
        (group &&
        typeof group === 'object' &&
        'blocks' in group &&
        Array.isArray(group.blocks)
          ? group.blocks.length
          : 0)
      )
    }, 0)
  }

  const getRestoredFromDetails = (restoredFromId: string) => {
    const originalSnapshot = allHistory.find((h) => h.id === restoredFromId)
    if (originalSnapshot) {
      return {
        author: originalSnapshot?.author?.name || 'Unknown',
        date: originalSnapshot.createdAt,
        origin: originalSnapshot.origin,
      }
    }
    return null
  }

  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [rollingBackItemId, setRollingBackItemId] = useState<string | null>(
    null
  )
  const [snapshotToRestore, setSnapshotToRestore] =
    useState<TypebotHistory | null>(null)
  const {
    isOpen: isRestoreConfirmOpen,
    onOpen: onRestoreConfirmOpen,
    onClose: onRestoreConfirmClose,
  } = useDisclosure()

  // Color values for restored items
  // const restoredBgColor = useColorModeValue("blue.50", "blue.900")

  const { mutate: duplicateTypebot } = trpc.typebot.importTypebot.useMutation({
    onSuccess: (data) => {
      window.location.href = `/typebots/${data.typebot.id}/edit`
    },
  })

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0])
    },
    {
      from: () => [-width, 0],
    }
  )

  const handleRollback = async (snapshot: TypebotHistory) => {
    if (!snapshot || rollingBackItemId) return

    try {
      setRollingBackItemId(snapshot.id)

      await rollbackTypebot(snapshot.id)

      showToast({
        title: t('preview.flowHistory.toast.rollbackComplete'),
        description: t('preview.flowHistory.toast.flowRestored'),
        status: 'success',
      })
    } catch (error) {
      console.error('Failed to rollback:', error)
      showToast({
        title: t('preview.flowHistory.toast.rollbackFailed'),
        description:
          error instanceof Error
            ? error.message
            : t('preview.flowHistory.toast.unknownError'),
        status: 'error',
      })
    } finally {
      setRollingBackItemId(null)
    }
  }

  const handleRestoreClick = (snapshot: TypebotHistory) => {
    setSnapshotToRestore(snapshot)
    onRestoreConfirmOpen()
  }

  const handleConfirmRestore = async () => {
    if (!snapshotToRestore) return
    onRestoreConfirmClose()
    await handleRollback(snapshotToRestore)
    setSnapshotToRestore(null)
  }

  const handleDuplicate = async (snapshot: TypebotHistory) => {
    console.log('Duplicating snapshot:', snapshot)
    if (!typebot || !snapshot || !snapshot.content) return

    try {
      const history = parseTypebotHistory(snapshot.content)

      duplicateTypebot({
        typebot: {
          ...history,
          name: `${typebot.name} ${t('editor.header.user.duplicateSuffix')}`,
        },
        workspaceId: typebot.workspaceId,
      })
    } catch (error) {
      console.error('Failed to duplicate:', error)
      showToast({
        title: t('preview.flowHistory.toast.duplicateFailed'),
        description:
          error instanceof Error
            ? error.message
            : t('preview.flowHistory.toast.unknownError'),
        status: 'error',
      })
    }
  }

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      bgColor={useColorModeValue('white', 'gray.900')}
      borderLeftWidth={'1px'}
      shadow="lg"
      borderLeftRadius={'lg'}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
      style={{ width: `${width}px` }}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          {...useResizeHandleDrag()}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
        />
      </Fade>

      <Stack w="full" spacing="4">
        <CloseButton pos="absolute" right="1rem" top="1rem" onClick={onClose} />

        <HStack spacing={3} alignItems="center" paddingRight={6}>
          <Heading fontSize="md">{t('preview.flowHistory.title')}</Heading>

          {isLoading && (
            <HStack spacing={2}>
              <Spinner size="xs" color="orange.500" />
              <Text fontSize="xs" color="orange.500">
                {t('preview.flowHistory.loading')}
              </Text>
            </HStack>
          )}
        </HStack>

        {historyData && historyData.history.length > 0 && (
          <Flex
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg={summaryBgColor}
            borderColor={summaryBorderColor}
            flexDir="column"
            gap={2}
          >
            <Text fontSize="sm" fontWeight="medium" color={summaryTitleColor}>
              {t('preview.flowHistory.summary.title')}
            </Text>
            <HStack spacing={4} fontSize="xs" wrap="wrap">
              <HStack spacing={1}>
                <Text fontWeight="medium">
                  {t('preview.flowHistory.summary.total')}
                </Text>
                <Text color={summaryTextColor}>
                  {historyData?.totalCount || 0}{' '}
                  {t('preview.flowHistory.summary.versions', {
                    count: historyData?.totalCount || 0,
                  })}
                </Text>
              </HStack>

              <HStack spacing={1}>
                <Text fontWeight="medium">
                  {t('preview.flowHistory.summary.oldest')}
                </Text>
                <Text color={summaryTextColor}>
                  {historyData?.oldestDate ? (
                    <TimeAgo date={historyData.oldestDate.toISOString()} />
                  ) : (
                    '--'
                  )}
                </Text>
              </HStack>

              <HStack spacing={1}>
                <Text fontWeight="medium">
                  {t('preview.flowHistory.summary.newest')}
                </Text>
                <Text color={summaryTextColor}>
                  {historyData?.newestDate ? (
                    <TimeAgo date={historyData.newestDate.toISOString()} />
                  ) : (
                    '--'
                  )}
                </Text>
              </HStack>
            </HStack>
          </Flex>
        )}

        {historyData &&
        historyData.history &&
        historyData.history.length === 0 &&
        !isLoading ? (
          <Text>{t('preview.flowHistory.noHistoryFound')}</Text>
        ) : (
          <Stack spacing={2} overflowY="auto" maxH="calc(100vh - 150px)" pr={2}>
            {allHistory.map((item) => (
              <Flex
                key={item.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                flexDir="column"
              >
                <HStack justifyContent="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Text fontWeight="medium" fontSize={`sm`}>
                      <TimeAgo date={item.createdAt.toISOString()} />
                    </Text>
                  </HStack>
                  <Text fontSize="xs">
                    <Tag
                      rounded="full"
                      colorScheme={getBadgeColorScheme(item.origin)}
                      size="sm"
                    >
                      {getOriginLabel(item.origin)}
                    </Tag>
                  </Text>
                </HStack>

                {item.content && (
                  <HStack spacing={3} wrap="wrap" fontSize={'sm'} mb={4}>
                    {item.content.groups && (
                      <HStack spacing={1}>
                        <Text fontWeight="medium" color="blue.300">
                          {item.content.groups.length}
                        </Text>
                        <Text color="gray.400">
                          {t('preview.flowHistory.snapshotDetails.groups', {
                            count: item.content.groups.length,
                          })}
                        </Text>
                      </HStack>
                    )}

                    {item.content.groups && (
                      <HStack spacing={1}>
                        <Text fontWeight="medium" color="green.500">
                          {countBlocks(item.content.groups)}
                        </Text>
                        <Text color="gray.400">
                          {t('preview.flowHistory.snapshotDetails.blocks', {
                            count: countBlocks(item.content.groups),
                          })}
                        </Text>
                      </HStack>
                    )}

                    {item.content.variables && (
                      <HStack spacing={1}>
                        <Text fontWeight="medium" color="orange.500">
                          {item.content.variables.length}
                        </Text>
                        <Text color="gray.400">
                          {t('preview.flowHistory.snapshotDetails.variables', {
                            count: item.content.variables.length,
                          })}
                        </Text>
                      </HStack>
                    )}

                    {item.content.edges && (
                      <HStack spacing={1}>
                        <Text fontWeight="medium" color="purple.500">
                          {item.content.edges.length}
                        </Text>
                        <Text color="gray.400">
                          {t(
                            'preview.flowHistory.snapshotDetails.connections',
                            {
                              count: item.content.edges.length,
                            }
                          )}
                        </Text>
                      </HStack>
                    )}
                    {item.isRestored && (
                      <HStack spacing={1} mt={1}>
                        <HStack spacing={1}>
                          <HistoryIcon boxSize="12px" color="blue.400" />
                          <Text
                            fontSize="xs"
                            color="blue.400"
                            fontWeight="medium"
                          >
                            {t('preview.flowHistory.item.restored')}
                          </Text>
                        </HStack>
                        {(() => {
                          const details = item.restoredFromId
                            ? getRestoredFromDetails(item.restoredFromId)
                            : null
                          if (details) {
                            return (
                              <Text fontSize="xs" color="blue.400">
                                {t('preview.flowHistory.item.restoredBy')}{' '}
                                {details.author} •{' '}
                                <TimeAgo date={details.date.toISOString()} />
                              </Text>
                            )
                          }
                          return (
                            <Text fontSize="xs" color="blue.400">
                              {t(
                                'preview.flowHistory.item.fromPreviousVersion'
                              )}
                            </Text>
                          )
                        })()}
                      </HStack>
                    )}
                  </HStack>
                )}
                <HStack justifyContent="space-between" spacing={2}>
                  <HStack>
                    <Avatar
                      name={item.author?.name ?? undefined}
                      src={item.author?.image ?? undefined}
                      boxSize="20px"
                    />
                    <Text fontSize="xs">
                      {item.author?.name ||
                        t('preview.flowHistory.item.unknownUser')}
                    </Text>
                  </HStack>
                  <HStack>
                    <Tooltip
                      label={t('preview.flowHistory.actions.restore')}
                      placement="bottom"
                    >
                      <IconButton
                        aria-label={t('preview.flowHistory.actions.restore')}
                        icon={<HistoryIcon />}
                        size="sm"
                        colorScheme="gray"
                        variant="outline"
                        onClick={() =>
                          handleRestoreClick(item as TypebotHistory)
                        }
                        isLoading={rollingBackItemId === item.id}
                      />
                    </Tooltip>
                    <Tooltip
                      label={t('preview.flowHistory.actions.duplicate')}
                      placement="bottom"
                    >
                      <IconButton
                        aria-label={t('preview.flowHistory.actions.duplicate')}
                        icon={<CopyIcon />}
                        size="sm"
                        colorScheme="gray"
                        variant="outline"
                        onClick={async () => {
                          await handleDuplicate(item as TypebotHistory)
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </Flex>
            ))}
            {hasNextPage && (
              <Flex justifyContent="center" py={2}>
                {isFetchingNextPage ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" color="orange.500" />
                    <Text fontSize="sm" color="orange.500">
                      {t('preview.flowHistory.loading')}
                    </Text>
                  </HStack>
                ) : (
                  <Text
                    fontSize="sm"
                    color="orange.500"
                    cursor="pointer"
                    onClick={() => fetchNextPage()}
                  >
                    {t('preview.flowHistory.actions.loadMore')}
                  </Text>
                )}
              </Flex>
            )}
            {!hasNextPage && allHistory.length > 0 && (
              <Flex justifyContent="center" py={4}>
                <Text fontSize="sm" color="gray.500">
                  {t('preview.flowHistory.endOfHistory')} 🎉
                </Text>
              </Flex>
            )}
          </Stack>
        )}

        <ConfirmModal
          isOpen={isRestoreConfirmOpen}
          onClose={onRestoreConfirmClose}
          onConfirm={handleConfirmRestore}
          title={t('preview.flowHistory.confirm.restoreTitle')}
          message={
            <Text>{t('preview.flowHistory.confirm.restoreMessage')}</Text>
          }
          confirmButtonLabel={t('preview.flowHistory.confirm.restoreButton')}
          confirmButtonColor="blue"
        />
      </Stack>
    </Flex>
  )
}
