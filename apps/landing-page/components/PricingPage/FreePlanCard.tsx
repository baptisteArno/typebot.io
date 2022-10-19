import { chakra, Tooltip, Text } from '@chakra-ui/react'
import { HelpCircleIcon } from 'assets/icons/HelpCircleIcon'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import React from 'react'
import { PricingCard } from './PricingCard'
import { ActionButton } from './PricingCard/ActionButton'

export const FreePlanCard = () => (
  <PricingCard
    data={{
      price: 'Free',
      name: 'Personal',
      features: [
        'Unlimited typebots',
        <>
          <Text>
            <chakra.span fontWeight="bold">300 chats</chakra.span> included
          </Text>
          &nbsp;
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
        </>,
        'Native integrations',
        'Webhooks',
        'Custom Javascript & CSS',
      ],
    }}
    button={
      <NextChakraLink
        href="https://app.typebot.io/register"
        _hover={{ textDecor: 'none' }}
      >
        <ActionButton variant="outline">Get started</ActionButton>
      </NextChakraLink>
    }
  />
)
