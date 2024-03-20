import { chakra, Tooltip, Text, Button } from '@chakra-ui/react'
import { HelpCircleIcon } from 'assets/icons/HelpCircleIcon'
import Link from 'next/link'
import React from 'react'
import { PricingCard } from './PricingCard'
import { chatsLimits } from '@typebot.io/billing/constants'

export const FreePlanCard = () => (
  <PricingCard
    data={{
      price: 'Free',
      name: 'Personal',
      features: [
        'Unlimited typebots',
        <>
          <Text>
            <chakra.span fontWeight="bold">{chatsLimits.FREE}</chakra.span>{' '}
            chats/month
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
        'Community support & Docs',
      ],
    }}
    button={
      <Button
        as={Link}
        href="https://app.typebot.io/register"
        variant="outline"
        colorScheme="gray"
        size="lg"
        w="full"
        fontWeight="extrabold"
        py={{ md: '8' }}
      >
        Get started
      </Button>
    }
  />
)
