import React from 'react'
import { chakra, Flex, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import {
  ListWithVerticalLines,
  VerticalListItem,
} from './ListWithVerticalLines'

export const MarketingCampaignsRecipe = () => {
  return (
    <Flex as="section" justify="center">
      <Stack style={{ maxWidth: '1200px' }} pt={32} w="full" px="4" spacing={6}>
        <VStack>
          <Heading as="h1" textAlign="center">
            Easy marketing campaign recipe
          </Heading>
          <Text color="gray.500" size="lg" textAlign="center">
            Typebot takes care of almost everything in your campaign.
          </Text>
        </VStack>

        <ListWithVerticalLines items={items} />
      </Stack>
    </Flex>
  )
}

const items: VerticalListItem[] = [
  {
    title: 'Create a Landing Page',
    subTitle: 'This is not handled by Typebot',
    icon: <Text fontWeight="bold">1</Text>,
    content: (
      <Text>
        You create a personalized landing page for the customers you are
        targeting for this campaign.
      </Text>
    ),
    isActivated: false,
  },
  {
    title: 'Create a lead generation form',
    icon: <Text fontWeight="bold">2</Text>,
    content: (
      <Stack>
        <Text>You need to create a form in order to qualify your lead</Text>
        <Text>
          Typebot allows you to create a{' '}
          <chakra.span fontWeight="bold">high-converting</chakra.span> form in a
          few minutes with a{' '}
          <chakra.span fontWeight="bold">
            dead simple building experience
          </chakra.span>
        </Text>
      </Stack>
    ),
  },
  {
    title: 'Connect the form to your existing tools',
    icon: <Text fontWeight="bold">3</Text>,
    content: (
      <Stack>
        <Text>
          You need to collect your generated leads in your CRM (Hubspot,
          Pipedrive) or in a Google Sheets for example.
        </Text>
        <Text fontWeight="bold">
          With Typebot, you connect your form to your existing tools in a few
          clicks thanks to our native integrations.
        </Text>
      </Stack>
    ),
  },
  {
    title: 'Embed the form in your landing page',
    icon: <Text fontWeight="bold">4</Text>,
    content: (
      <Stack>
        <Text>
          Your form needs to be embedded in your landing page. Most of the time,
          it is painful when you're not a coder.
        </Text>
        <Text>
          Typebot helps you easily embed your form with a dedicated library that
          handles everything.
        </Text>
      </Stack>
    ),
  },
  {
    title: 'Run your campaign',
    subTitle: 'This is not handled by Typebot',
    icon: <Text fontWeight="bold">5</Text>,
    content: <Text>This is not handled by Typebot</Text>,
    isActivated: false,
  },
  {
    title: 'Iterate & improve your conversion',
    icon: <Text fontWeight="bold">6</Text>,
    content: (
      <Stack>
        <Text>
          When a marketing campaign is launched you don't sit and wait for the
          results. You have to analyse the results and potentially improve
          things in order to increase the conversion rate.
        </Text>
        <Text>
          Typebot comes with tools to analyse your typebot performance in real
          time and helps you iterate quickly on improvements so that you
          optimise your conversion rate and your campaign budget.{' '}
        </Text>
      </Stack>
    ),
  },
]
