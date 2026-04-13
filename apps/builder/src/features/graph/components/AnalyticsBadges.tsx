import { Box, Flex, Tag, Tooltip, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import type {
  GroupAnalytics,
  BlockIssue,
} from '@/features/analytics/components/AnalyticsGraphContainer'
import { useGroupsStore } from '../hooks/useGroupsStore'
import { useShallow } from 'zustand/react/shallow'
import { useEndpoints } from '../providers/EndpointsProvider'
import { groupWidth } from '../constants'

type GroupAnalyticsBadgeProps = {
  groupId: string
  analytics?: GroupAnalytics
}

export const GroupAnalyticsBadge = ({
  groupId,
  analytics,
}: GroupAnalyticsBadgeProps) => {
  const groupCoordinates = useGroupsStore(
    useShallow((state) =>
      state.groupsCoordinates ? state.groupsCoordinates[groupId] : undefined
    )
  )

  const visitBg = useColorModeValue('blue.500', 'blue.400')
  const arrowColor = useColorModeValue('blue.500', 'blue.400')

  if (!groupCoordinates || !analytics) return null
  if (analytics.visits === 0) return null

  return (
    <Flex
      pos="absolute"
      style={{
        transform: `translate(${groupCoordinates.x}px, ${groupCoordinates.y - 76}px)`,
      }}
      w={`${groupWidth}px`}
      direction="column"
      align="center"
      pointerEvents="all"
    >
      <Tooltip
        label={`${analytics.visits} sessões passaram por este grupo (${analytics.visitPercentage}% do total)`}
        placement="top"
        hasArrow
      >
        <Tag
          bgColor={visitBg}
          color="white"
          fontWeight="extrabold"
          fontSize="2xl"
          borderRadius="xl"
          px="7"
          py="3.5"
          cursor="default"
          minH="58px"
          boxShadow="xl"
          letterSpacing="wide"
        >
          {analytics.visitPercentage}% passaram
        </Tag>
      </Tooltip>

      <Box
        w="0"
        h="0"
        borderLeft="12px solid transparent"
        borderRight="12px solid transparent"
        borderTop="14px solid"
        borderTopColor={arrowColor}
        mt="1px"
      />
    </Flex>
  )
}

type BlockIssueBadgeProps = {
  issue: BlockIssue
}

export const BlockIssueBadge = ({ issue }: BlockIssueBadgeProps) => {
  const groupCoordinates = useGroupsStore(
    useShallow((state) =>
      state.groupsCoordinates
        ? state.groupsCoordinates[issue.groupId]
        : undefined
    )
  )
  const { sourceEndpointYOffsets, targetEndpointYOffsets } = useEndpoints()
  const blockEndpoint =
    sourceEndpointYOffsets.get(issue.blockId) ??
    targetEndpointYOffsets.get(issue.blockId)

  const errorBg = useColorModeValue('red.500', 'red.400')
  const abandonBg = useColorModeValue('orange.500', 'orange.400')
  const arrowColor = issue.type === 'error' ? errorBg : abandonBg

  if (!groupCoordinates || !blockEndpoint) return null
  if (issue.count === 0) return null

  const bg = issue.type === 'error' ? errorBg : abandonBg
  const icon = issue.type === 'error' ? '⚠' : '↓'
  const label =
    issue.type === 'error'
      ? `${issue.count} sessões com erro neste bloco (${issue.percentage}%)`
      : `${issue.count} sessões abandonaram neste bloco (${issue.percentage}%)`

  const badgeX = groupCoordinates.x + groupWidth + 16
  const badgeY = blockEndpoint.y - 32

  return (
    <Flex
      pos="absolute"
      style={{ transform: `translate(${badgeX}px, ${badgeY}px)` }}
      align="center"
      pointerEvents="all"
    >
      <Flex
        w="0"
        h="0"
        borderTop="12px solid transparent"
        borderBottom="12px solid transparent"
        borderRight="14px solid"
        borderRightColor={arrowColor}
      />
      <Tooltip label={label} placement="right" hasArrow>
        <Tag
          bgColor={bg}
          color="white"
          fontWeight="extrabold"
          fontSize="2xl"
          borderRadius="xl"
          px="7"
          py="3.5"
          cursor="default"
          minH="58px"
          whiteSpace="nowrap"
          boxShadow="xl"
          letterSpacing="wide"
        >
          {icon} {issue.percentage}%
        </Tag>
      </Tooltip>
    </Flex>
  )
}
