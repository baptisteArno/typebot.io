import {
  chakra,
  Tooltip,
  Text,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { ChevronDownIcon } from 'assets/icons/ChevronDownIcon'
import { HelpCircleIcon } from 'assets/icons/HelpCircleIcon'
import { Plan } from 'db'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
  chatsLimit,
  computePrice,
  parseNumberWithCommas,
  storageLimit,
} from 'utils'
import { PricingCard } from './PricingCard'

export const ProPlanCard = () => {
  const [price, setPrice] = useState(89)

  const [selectedChatsLimitIndex, setSelectedChatsLimitIndex] =
    useState<number>(0)
  const [selectedStorageLimitIndex, setSelectedStorageLimitIndex] =
    useState<number>(0)

  useEffect(() => {
    setPrice(
      computePrice(
        Plan.PRO,
        selectedChatsLimitIndex ?? 0,
        selectedStorageLimitIndex ?? 0
      ) ?? NaN
    )
  }, [selectedChatsLimitIndex, selectedStorageLimitIndex])

  return (
    <PricingCard
      data={{
        price,
        name: 'Pro',
        featureLabel: 'Everything in Personal, plus:',
        features: [
          <Text key="seats">
            <chakra.span fontWeight="bold">5 seats</chakra.span> included
          </Text>,
          <HStack key="chats" spacing={1.5}>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
                variant="outline"
                isLoading={selectedChatsLimitIndex === undefined}
              >
                {selectedChatsLimitIndex !== undefined
                  ? parseNumberWithCommas(
                      chatsLimit.PRO.totalIncluded +
                        chatsLimit.PRO.increaseStep.amount *
                          selectedChatsLimitIndex
                    )
                  : undefined}
              </MenuButton>
              <MenuList>
                {selectedChatsLimitIndex !== 0 && (
                  <MenuItem onClick={() => setSelectedChatsLimitIndex(0)}>
                    {parseNumberWithCommas(chatsLimit.PRO.totalIncluded)}
                  </MenuItem>
                )}
                {selectedChatsLimitIndex !== 1 && (
                  <MenuItem onClick={() => setSelectedChatsLimitIndex(1)}>
                    {parseNumberWithCommas(
                      chatsLimit.PRO.totalIncluded +
                        chatsLimit.PRO.increaseStep.amount
                    )}
                  </MenuItem>
                )}
                {selectedChatsLimitIndex !== 2 && (
                  <MenuItem onClick={() => setSelectedChatsLimitIndex(2)}>
                    {parseNumberWithCommas(
                      chatsLimit.PRO.totalIncluded +
                        chatsLimit.PRO.increaseStep.amount * 2
                    )}
                  </MenuItem>
                )}
                {selectedChatsLimitIndex !== 3 && (
                  <MenuItem onClick={() => setSelectedChatsLimitIndex(3)}>
                    {parseNumberWithCommas(
                      chatsLimit.PRO.totalIncluded +
                        chatsLimit.PRO.increaseStep.amount * 3
                    )}
                  </MenuItem>
                )}
                {selectedChatsLimitIndex !== 4 && (
                  <MenuItem onClick={() => setSelectedChatsLimitIndex(4)}>
                    {parseNumberWithCommas(
                      chatsLimit.PRO.totalIncluded +
                        chatsLimit.PRO.increaseStep.amount * 4
                    )}
                  </MenuItem>
                )}
              </MenuList>
            </Menu>{' '}
            <Text>chats/mo</Text>
            <Tooltip
              hasArrow
              placement="top"
              label="A chat is counted whenever a user starts a discussion. It is
    independant of the number of messages he sends and receives."
            >
              <chakra.span cursor="pointer" h="7">
                <HelpCircleIcon />
              </chakra.span>
            </Tooltip>
          </HStack>,
          <HStack key="storage" spacing={1.5}>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
                variant="outline"
                isLoading={selectedStorageLimitIndex === undefined}
              >
                {selectedStorageLimitIndex !== undefined
                  ? parseNumberWithCommas(
                      storageLimit.PRO.totalIncluded +
                        storageLimit.PRO.increaseStep.amount *
                          selectedStorageLimitIndex
                    )
                  : undefined}
              </MenuButton>
              <MenuList>
                {selectedStorageLimitIndex !== 0 && (
                  <MenuItem onClick={() => setSelectedStorageLimitIndex(0)}>
                    {parseNumberWithCommas(storageLimit.PRO.totalIncluded)}
                  </MenuItem>
                )}
                {selectedStorageLimitIndex !== 1 && (
                  <MenuItem onClick={() => setSelectedStorageLimitIndex(1)}>
                    {parseNumberWithCommas(
                      storageLimit.PRO.totalIncluded +
                        storageLimit.PRO.increaseStep.amount
                    )}
                  </MenuItem>
                )}
                {selectedStorageLimitIndex !== 2 && (
                  <MenuItem onClick={() => setSelectedStorageLimitIndex(2)}>
                    {parseNumberWithCommas(
                      storageLimit.PRO.totalIncluded +
                        storageLimit.PRO.increaseStep.amount * 2
                    )}
                  </MenuItem>
                )}
                {selectedStorageLimitIndex !== 3 && (
                  <MenuItem onClick={() => setSelectedStorageLimitIndex(3)}>
                    {parseNumberWithCommas(
                      storageLimit.PRO.totalIncluded +
                        storageLimit.PRO.increaseStep.amount * 3
                    )}
                  </MenuItem>
                )}
                {selectedStorageLimitIndex !== 4 && (
                  <MenuItem onClick={() => setSelectedStorageLimitIndex(4)}>
                    {parseNumberWithCommas(
                      storageLimit.PRO.totalIncluded +
                        storageLimit.PRO.increaseStep.amount * 4
                    )}
                  </MenuItem>
                )}
              </MenuList>
            </Menu>{' '}
            <Text>GB of storage</Text>
            <Tooltip
              hasArrow
              placement="top"
              label="You accumulate storage for every file that your user upload
        into your bot. If you delete the result, it will free up the
        space."
            >
              <chakra.span cursor="pointer" h="7">
                <HelpCircleIcon />
              </chakra.span>
            </Tooltip>
          </HStack>,
          'Custom domains',
          'In-depth analytics',
        ],
      }}
      borderWidth="3px"
      borderColor="blue.200"
      button={
        <Button
          as={Link}
          href={`https://app.typebot.io/register?subscribePlan=${Plan.PRO}&chats=${selectedChatsLimitIndex}&storage=${selectedStorageLimitIndex}`}
          colorScheme="blue"
          size="lg"
          w="full"
          fontWeight="extrabold"
          py={{ md: '8' }}
        >
          Subscribe now
        </Button>
      }
    />
  )
}
