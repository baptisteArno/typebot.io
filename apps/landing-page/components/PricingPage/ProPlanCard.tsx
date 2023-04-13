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
import { Plan } from '@typebot.io/prisma'
import Link from 'next/link'
import React, { useState } from 'react'
import { parseNumberWithCommas } from '@typebot.io/lib'
import {
  chatsLimit,
  computePrice,
  seatsLimit,
  storageLimit,
} from '@typebot.io/lib/pricing'
import { PricingCard } from './PricingCard'

type Props = {
  isYearly: boolean
}

export const ProPlanCard = ({ isYearly }: Props) => {
  const [selectedChatsLimitIndex, setSelectedChatsLimitIndex] =
    useState<number>(0)
  const [selectedStorageLimitIndex, setSelectedStorageLimitIndex] =
    useState<number>(0)

  const price =
    computePrice(
      Plan.PRO,
      selectedChatsLimitIndex ?? 0,
      selectedStorageLimitIndex ?? 0,
      isYearly ? 'yearly' : 'monthly'
    ) ?? NaN

  return (
    <PricingCard
      data={{
        price,
        name: 'Pro',
        featureLabel: 'Everything in Personal, plus:',
        features: [
          <Text key="seats">
            <chakra.span fontWeight="bold">
              {seatsLimit.PRO.totalIncluded} seats
            </chakra.span>{' '}
            included
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
                      chatsLimit.PRO.graduatedPrice[selectedChatsLimitIndex]
                        .totalIncluded
                    )
                  : undefined}
              </MenuButton>
              <MenuList>
                {chatsLimit.PRO.graduatedPrice.map((price, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => setSelectedChatsLimitIndex(index)}
                  >
                    {parseNumberWithCommas(price.totalIncluded)}
                  </MenuItem>
                ))}
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
                      storageLimit.PRO.graduatedPrice[selectedStorageLimitIndex]
                        .totalIncluded
                    )
                  : undefined}
              </MenuButton>
              <MenuList>
                {storageLimit.PRO.graduatedPrice.map((price, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => setSelectedStorageLimitIndex(index)}
                  >
                    {parseNumberWithCommas(price.totalIncluded)}
                  </MenuItem>
                ))}
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
          href={`https://app.typebot.io/register?subscribePlan=${Plan.PRO}&chats=${selectedChatsLimitIndex}&storage=${selectedStorageLimitIndex}&isYearly=${isYearly}`}
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
