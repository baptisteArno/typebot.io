import {
  Box,
  Collapse,
  Flex,
  IconProps,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  BarChart2Icon,
  CheckIcon,
  TargetIcon,
  AlertIcon,
  LogOutIcon,
  UserIcon,
  FlagIcon,
  ChatIcon,
  LockedIcon,
  ClockIcon,
} from '@/components/icons'
import React from 'react'
import { trpc } from '@/lib/trpc'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { isDefined } from '@typebot.io/lib'
import { timeFilterValues } from '../constants'
import { TimeFilterDropdown } from './TimeFilterDropdown'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

type Props = {
  timeFilter: (typeof timeFilterValues)[number]
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void
  isExpanded: boolean
  onToggle: () => void
}

const formatDuration = (ms: number | null): string => {
  if (ms === null) return '—'
  const totalSecs = Math.round(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

type MetricCardProps = {
  label: string
  value: string | number | undefined
  accent: string
  accentLight: string
  IconComponent: (props: IconProps) => JSX.Element
}

const MetricCard = ({ label, value, accent, accentLight, IconComponent }: MetricCardProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.800', 'white')

  return (
    <Flex
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      rounded="xl"
      p="4"
      align="center"
      gap="3"
      transition="all 0.15s"
      _hover={{ shadow: 'md', borderColor: accent }}
    >
      <Flex
        w="40px"
        h="40px"
        rounded="lg"
        bg={accentLight}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <IconComponent color={accent} boxSize="18px" />
      </Flex>
      <Box flex="1" minW="0">
        <Text fontSize="xs" color={labelColor} fontWeight="medium" noOfLines={1}>
          {label}
        </Text>
        {isDefined(value) ? (
          <Text fontSize="xl" fontWeight="bold" color={valueColor} lineHeight="1.2">
            {value}
          </Text>
        ) : (
          <Skeleton w="60%" h="20px" mt="1" rounded="md" />
        )}
      </Box>
    </Flex>
  )
}

export const CxMetricsPanel = ({
  timeFilter,
  onTimeFilterChange,
  isExpanded,
  onToggle,
}: Props) => {
  const { typebot } = useTypebot()
  const panelBg = useColorModeValue('gray.50', 'gray.900')
  const chartBg = useColorModeValue('white', 'gray.800')
  const chartBorder = useColorModeValue('gray.100', 'gray.700')
  const toggleBg = useColorModeValue('white', 'gray.800')
  const toggleBorder = useColorModeValue('gray.200', 'gray.700')
  const toggleText = useColorModeValue('gray.600', 'gray.300')
  const toggleHoverBg = useColorModeValue('gray.50', 'gray.700')
  const barColor = useColorModeValue('blue.400', 'blue.300')

  const { data } = trpc.analytics.getCxStats.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(typebot?.id) }
  )

  const stats = data?.cxStats

  const mainCards: MetricCardProps[] = [
    { label: 'Volume total', value: stats?.totalSessions, accent: 'blue.500', accentLight: 'blue.50', IconComponent: BarChart2Icon },
    { label: 'Concluídas', value: stats?.completed, accent: 'green.500', accentLight: 'green.50', IconComponent: CheckIcon },
    { label: 'Taxa de conclusão', value: stats ? `${stats.completionRate}%` : undefined, accent: 'teal.500', accentLight: 'teal.50', IconComponent: TargetIcon },
    { label: 'Erros', value: stats?.errors, accent: 'red.500', accentLight: 'red.50', IconComponent: AlertIcon },
    { label: 'Abandonos', value: stats?.abandoned, accent: 'purple.500', accentLight: 'purple.50', IconComponent: LogOutIcon },
  ]

  const cxCards: MetricCardProps[] = [
    { label: 'Forward to Humans N2', value: stats?.forwardToHumansN2, accent: 'orange.500', accentLight: 'orange.50', IconComponent: UserIcon },
    { label: 'End Flow N1', value: stats?.endFlowN1, accent: 'cyan.600', accentLight: 'cyan.50', IconComponent: FlagIcon },
    { label: 'Answer Ticket N1', value: stats?.answerTicket, accent: 'blue.500', accentLight: 'blue.50', IconComponent: ChatIcon },
    { label: 'Close Ticket', value: stats?.closeTicket, accent: 'green.500', accentLight: 'green.50', IconComponent: LockedIcon },
    { label: 'Tempo médio', value: stats ? formatDuration(stats.avgSessionDurationMs) : undefined, accent: 'gray.500', accentLight: 'gray.100', IconComponent: ClockIcon },
  ]

  const volumeByDay = stats?.volumeByDay ?? []
  const maxVolume = Math.max(...volumeByDay.map((d) => d.count), 1)

  const ChevronIcon = isExpanded ? ChevronUpIcon : ChevronDownIcon

  return (
    <Box w="full" flexShrink={0}>
      <Collapse in={isExpanded} animateOpacity>
        <Box px="5" pb="4" pt="4" bg={panelBg} overflowY="auto" maxH="480px">
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="gray.400" mb="3">
            Visão geral
          </Text>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing="3" mb="5">
            {mainCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </SimpleGrid>

          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="gray.400" mb="3">
            Ações da Claudia
          </Text>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing="3" mb="5">
            {cxCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </SimpleGrid>

          {volumeByDay.length > 0 && (
            <Box
              bg={chartBg}
              border="1px solid"
              borderColor={chartBorder}
              p="5"
              rounded="xl"
            >
              <HStack justify="space-between" mb="4">
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                  Volume por dia
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {volumeByDay.length} dias
                </Text>
              </HStack>
              <Flex align="flex-end" gap="1.5" h="160px" pb="6">
                {volumeByDay.map((day) => {
                  const heightPct = (day.count / maxVolume) * 100
                  return (
                    <Tooltip
                      key={day.date}
                      label={`${day.date}: ${day.count} sessões`}
                      placement="top"
                      hasArrow
                      bg="gray.700"
                      color="white"
                      rounded="md"
                      px="3"
                      py="1.5"
                      fontSize="xs"
                    >
                      <Flex
                        direction="column"
                        align="center"
                        minW="24px"
                        flex="1"
                        h="full"
                        justify="flex-end"
                      >
                        <Text
                          fontSize="2xs"
                          fontWeight="bold"
                          color={barColor}
                          mb="1"
                        >
                          {day.count > 0 ? day.count : ''}
                        </Text>
                        <Box
                          w="18px"
                          bgGradient="linear(to-t, blue.500, blue.300)"
                          rounded="md"
                          h={`${Math.max(heightPct, 4)}%`}
                          transition="all 0.2s"
                          _hover={{
                            bgGradient: 'linear(to-t, blue.600, blue.400)',
                            transform: 'scaleX(1.15)',
                          }}
                        />
                        <Text
                          fontSize="2xs"
                          color="gray.400"
                          mt="1.5"
                          whiteSpace="nowrap"
                        >
                          {day.date.slice(5)}
                        </Text>
                      </Flex>
                    </Tooltip>
                  )
                })}
              </Flex>
            </Box>
          )}
        </Box>
      </Collapse>

      <Flex
        w="full"
        align="center"
        py="2"
        px="5"
        bg={toggleBg}
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor={toggleBorder}
      >
        <TimeFilterDropdown
          timeFilter={timeFilter}
          onTimeFilterChange={onTimeFilterChange}
          size="xs"
        />
        <Flex
          as="button"
          onClick={onToggle}
          flex="1"
          justify="center"
          align="center"
          gap="2"
          cursor="pointer"
          rounded="md"
          py="1"
          _hover={{ bg: toggleHoverBg }}
          transition="all 0.15s"
        >
          <ChevronIcon boxSize="4" color={toggleText} />
          <Text fontSize="xs" fontWeight="semibold" color={toggleText}>
            {isExpanded ? 'Recolher métricas do fluxo' : 'Métricas do fluxo'}
          </Text>
          <ChevronIcon boxSize="4" color={toggleText} />
        </Flex>
      </Flex>
    </Box>
  )
}
