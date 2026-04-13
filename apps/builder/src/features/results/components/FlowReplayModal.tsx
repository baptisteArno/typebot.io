import {
  Badge,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isDefined } from '@typebot.io/lib'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useResults } from '../ResultsProvider'
import { Graph } from '@/features/graph/components/Graph'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { EventsCoordinatesProvider } from '@/features/graph/providers/EventsCoordinateProvider'
import { Edge, VisitedBlockEntry } from '@typebot.io/schemas'
import { trpc } from '@/lib/trpc'

type Props = {
  resultId: string | null
  onClose: () => void
}

const statusDisplay: Record<
  string,
  { label: string; colorScheme: string }
> = {
  completed: { label: 'Completed', colorScheme: 'green' },
  error: { label: 'Error', colorScheme: 'red' },
  abandoned: { label: 'Abandoned', colorScheme: 'purple' },
  in_progress: { label: 'In Progress', colorScheme: 'gray' },
}

const blockStatusColors: Record<string, { border: string; bg: string }> = {
  ok: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  error: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  dead_end: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  abandoned: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
}

const edgePathColors: Record<string, string> = Object.fromEntries(
  Object.entries(blockStatusColors).map(([key, val]) => [key, val.border])
)

const findEdgeBetweenGroups = (
  edges: Edge[],
  fromBlockId: string,
  fromGroupId: string,
  toGroupId: string,
  visitedBlocks: VisitedBlockEntry[]
): Edge | undefined =>
  edges.find(
    (e) =>
      'blockId' in e.from &&
      e.from.blockId === fromBlockId &&
      e.to.groupId === toGroupId
  ) ??
  edges.find(
    (e) =>
      'blockId' in e.from &&
      e.to.groupId === toGroupId &&
      visitedBlocks.some(
        (vb) => vb.groupId === fromGroupId && vb.blockId === e.from.blockId
      )
  )

const computeHighlightedEdges = (
  visitedBlocks: VisitedBlockEntry[],
  edges: Edge[]
): Map<string, string> => {
  const highlighted = new Map<string, string>()
  if (visitedBlocks.length === 0) return highlighted

  const resolveColor = (status: string) =>
    edgePathColors[status] ?? edgePathColors.ok

  const firstBlock = visitedBlocks[0]
  const startEdge = edges.find(
    (e) => 'eventId' in e.from && e.to.groupId === firstBlock.groupId
  )
  if (startEdge) {
    highlighted.set(startEdge.id, resolveColor(firstBlock.status))
  }

  for (let i = 0; i < visitedBlocks.length - 1; i++) {
    const current = visitedBlocks[i]
    const next = visitedBlocks[i + 1]
    if (current.groupId === next.groupId) continue

    const edge = findEdgeBetweenGroups(
      edges,
      current.blockId,
      current.groupId,
      next.groupId,
      visitedBlocks
    )
    if (edge) {
      highlighted.set(edge.id, resolveColor(next.status))
    }
  }
  return highlighted
}

export const FlowReplayModal = ({ resultId, onClose }: Props) => {
  const { typebot, publishedTypebot } = useTypebot()
  const { flatResults } = useResults()
  const bgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const bgPattern = useColorModeValue(
    'radial-gradient(#c6d0e1 1px, transparent 0)',
    'radial-gradient(#2f2f39 1px, transparent 0)'
  )

  const result = useMemo(
    () =>
      isDefined(resultId)
        ? flatResults.find((r) => r.id === resultId)
        : undefined,
    [resultId, flatResults]
  )

  const { data: sessionData, isLoading: isLoadingSession } =
    trpc.results.getSessionTypebot.useQuery(
      {
        typebotId: typebot?.id as string,
        resultId: resultId as string,
      },
      { enabled: isDefined(resultId) && isDefined(typebot?.id) }
    )

  const replayTypebot = useMemo(() => {
    if (sessionData?.typebot) {
      const snap = sessionData.typebot as any
      return {
        ...snap,
        typebotId: snap.typebotId ?? typebot?.id ?? '',
        events: snap.events ?? publishedTypebot?.events ?? [],
        groups: snap.groups ?? [],
        edges: snap.edges ?? [],
        variables: snap.variables ?? [],
      }
    }
    return publishedTypebot ?? null
  }, [sessionData, publishedTypebot, typebot?.id])

  const visitedBlocks: VisitedBlockEntry[] = useMemo(() => {
    if (!result) return []
    const blocks = Array.isArray(result.visitedBlocks)
      ? [...result.visitedBlocks]
      : []
    if (
      blocks.length > 0 &&
      result.status === 'abandoned' &&
      blocks[blocks.length - 1].status === 'ok'
    ) {
      blocks[blocks.length - 1] = {
        ...blocks[blocks.length - 1],
        status: 'abandoned',
      }
    }
    return blocks
  }, [result])

  const highlightedEdges = useMemo(() => {
    if (!visitedBlocks.length || !replayTypebot) return new Map()
    return computeHighlightedEdges(visitedBlocks, replayTypebot.edges)
  }, [visitedBlocks, replayTypebot])

  const dynamicStyles = useMemo(() => {
    if (!visitedBlocks.length) return ''

    const visitedGroupIds = new Set(visitedBlocks.map((b) => b.groupId))
    const visitedGroupSelectors = Array.from(visitedGroupIds)
      .map((gid) => `[id="group-${gid}"]`)
      .join(', ')
    const visitedEdgeSelectors = Array.from(highlightedEdges.keys())
      .map((eid) => `[data-edge-id="${eid}"]`)
      .join(', ')

    const dimStyles = [
      `[data-testid="group"] { opacity: 0.3; transition: opacity 0.2s; }`,
      `[data-testid="edge"], [data-testid="clickable-edge"] { opacity: 0.3; transition: opacity 0.2s; }`,
      visitedGroupSelectors
        ? `${visitedGroupSelectors} { opacity: 1 !important; }`
        : '',
      visitedEdgeSelectors
        ? `${visitedEdgeSelectors} { opacity: 1 !important; }`
        : '',
    ]
      .filter(Boolean)
      .join('\n')

    const blockStyles = visitedBlocks
      .map((block) => {
        const colors = blockStatusColors[block.status] ?? blockStatusColors.ok
        return `[data-testid="block ${block.blockId}"] { border: 2px solid ${colors.border} !important; background-color: ${colors.bg} !important; border-radius: 6px; }`
      })
      .join('\n')

    const edgeStyles = Array.from(highlightedEdges.entries())
      .map(
        ([edgeId, color]) =>
          `[data-edge-id="${edgeId}"] { stroke: ${color} !important; stroke-width: 3px !important; }`
      )
      .join('\n')

    return `${dimStyles}\n${blockStyles}\n${edgeStyles}`
  }, [visitedBlocks, highlightedEdges])

  const status = result?.status ?? 'in_progress'
  const helpdeskId = result?.helpdeskId
  const statusCfg = statusDisplay[status] ?? statusDisplay.in_progress

  const duration = useMemo(() => {
    if (!result?.createdAt || !visitedBlocks.length) return null
    const start = new Date(result.createdAt).getTime()
    const lastTimestamp = visitedBlocks[visitedBlocks.length - 1]?.timestamp
    if (!lastTimestamp) return null
    const end = new Date(lastTimestamp).getTime()
    const diffMs = end - start
    if (diffMs < 0) return null
    const mins = Math.floor(diffMs / 60000)
    const secs = Math.floor((diffMs % 60000) / 1000)
    return `${mins}m ${secs}s`
  }, [result, visitedBlocks])

  const isLoading = isLoadingSession || !replayTypebot

  if (!publishedTypebot) return null

  return (
    <Modal
      isOpen={isDefined(result)}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent m="4" maxH="calc(100vh - 32px)" borderRadius="xl">
        <ModalCloseButton zIndex={10} />
        <ModalHeader pb="2">
          <HStack spacing="4" flexWrap="wrap">
            {helpdeskId && (
              <Text fontSize="sm" color="gray.500">
                Helpdesk: <strong>{helpdeskId}</strong>
              </Text>
            )}
            {result?.createdAt && (
              <Text fontSize="sm" color="gray.500">
                {new Date(result.createdAt).toLocaleString()}
              </Text>
            )}
            <Badge colorScheme={statusCfg.colorScheme}>
              {statusCfg.label}
            </Badge>
            {duration && (
              <Text fontSize="sm" color="gray.500">
                Duração: {duration}
              </Text>
            )}
            <Text fontSize="sm" color="gray.500">
              {visitedBlocks.length} bloco
              {visitedBlocks.length !== 1 ? 's' : ''} visitados
            </Text>
            {sessionData?.typebot && (
              <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
                Snapshot da sessão
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalBody p="0" overflow="hidden" flex="1">
          <style>{dynamicStyles}</style>
          <Flex
            w="full"
            h="full"
            minH="calc(100vh - 140px)"
            pos="relative"
            bgColor={bgColor}
            backgroundImage={bgPattern}
            backgroundSize="40px 40px"
            backgroundPosition="-19px -19px"
            justifyContent="center"
          >
            {isLoading ? (
              <Flex
                justify="center"
                align="center"
                boxSize="full"
                bgColor="rgba(255, 255, 255, 0.5)"
              >
                <Spinner color="gray" />
              </Flex>
            ) : (
              <GraphProvider isReadOnly isAnalytics={false}>
                <EventsCoordinatesProvider
                  events={replayTypebot.events}
                >
                  <Graph
                    flex="1"
                    typebot={replayTypebot}
                    highlightedEdges={highlightedEdges}
                  />
                </EventsCoordinatesProvider>
              </GraphProvider>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
