import React from 'react'
import {
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
} from 'kbar'
import { chakra, Flex } from '@chakra-ui/react'

// eslint-disable-next-line @typescript-eslint/ban-types
type KBarProps = {}

const KBarSearchChakra = chakra(KBarSearch)
const KBarAnimatorChakra = chakra(KBarAnimator)
const KBarResultsChakra = chakra(KBarResults)

export const KBar = ({}: KBarProps) => {
  return (
    <KBarPortal>
      <KBarPositioner>
        <KBarAnimatorChakra shadow="2xl" rounded="md">
          <KBarSearchChakra
            p={4}
            w="500px"
            roundedTop="md"
            _focus={{ outline: 'none' }}
          />
          <RenderResults />
        </KBarAnimatorChakra>
      </KBarPositioner>
    </KBarPortal>
  )
}

const RenderResults = () => {
  const { results } = useMatches()

  return (
    <KBarResultsChakra
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <Flex height="50px">{item}</Flex>
        ) : (
          <Flex
            height="50px"
            roundedBottom="md"
            align="center"
            px="4"
            bgColor={active ? 'blue.50' : 'white'}
            _hover={{ bgColor: 'blue.50' }}
          >
            {active && (
              <Flex
                pos="absolute"
                left="0"
                h="full"
                w="3px"
                roundedRight="md"
                bgColor={'blue.500'}
              />
            )}
            {item.name}
          </Flex>
        )
      }
    />
  )
}
