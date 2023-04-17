import React from 'react'
import { Flex, Stack, useColorModeValue, Text, Tag } from '@chakra-ui/react'
import { AbTestBlock } from '@typebot.io/schemas'
import { SourceEndpoint } from '@/features/graph/components/endpoints/SourceEndpoint'

type Props = {
  block: AbTestBlock
}

export const AbTestNodeBody = ({ block }: Props) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bg = useColorModeValue('white', undefined)

  return (
    <Stack spacing={2} w="full">
      <Flex
        pos="relative"
        align="center"
        shadow="sm"
        rounded="md"
        bg={bg}
        borderWidth={'1px'}
        borderColor={borderColor}
        w="full"
      >
        <Text p="3">
          A <Tag>{block.options.aPercent}%</Tag>
        </Text>
        <SourceEndpoint
          source={{
            groupId: block.groupId,
            blockId: block.id,
            itemId: block.items[0].id,
          }}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Flex>
      <Flex
        pos="relative"
        align="center"
        shadow="sm"
        rounded="md"
        bg={bg}
        borderWidth={'1px'}
        borderColor={borderColor}
        w="full"
      >
        <Text p="3">
          B <Tag>{100 - block.options.aPercent}%</Tag>
        </Text>
        <SourceEndpoint
          source={{
            groupId: block.groupId,
            blockId: block.id,
            itemId: block.items[1].id,
          }}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Flex>
    </Stack>
  )
}
