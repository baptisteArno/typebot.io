import React from 'react'
import {
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FeatureCard } from './FeatureCard'
import { FolderIcon } from 'assets/icons/FolderIcon'
import { AccessibilityIcon } from 'assets/icons/AccessibilityIcon'
import { CalculatorIcon } from 'assets/icons/CaluclatorIcon'
import { ConditionIcon } from 'assets/icons/ConditionIcon'
import { PersonAddIcon } from 'assets/icons/PersonAddIcon'
import { ShareIcon } from 'assets/icons/ShareIcon'

const features = [
  {
    Icon: AccessibilityIcon,
    title: 'Hidden fields',
    content:
      'Include data in your form URL to segment your user and use its data directly in your form.',
  },
  {
    Icon: PersonAddIcon,
    title: 'Team collaboration',
    content: 'Invite your teammates to work on your typebot with you',
  },
  {
    Icon: ConditionIcon,
    title: 'Conditional branching',
    content:
      'Make your form smarter by adding conditions to display custom answers to your users',
  },
  {
    Icon: CalculatorIcon,
    title: 'Computation',
    content:
      'Use the calculator to compute anything in Typebot directly to generate a quote or compute a score',
  },
  {
    Icon: ShareIcon,
    title: 'Custom domain',
    content: 'Connect your typebot to the custom URL of your choice',
  },
  {
    Icon: FolderIcon,
    title: 'Folder management',
    content:
      'Organize your typebots in specific folders to keep it clean and work with multiple clients',
  },
]

export const Features = () => {
  return (
    <Flex justifyContent="center">
      <Stack style={{ maxWidth: '1200px' }} pt={32} w="full" px="4" spacing={6}>
        <VStack>
          <Heading as="h1" textAlign="center">
            And many more features
          </Heading>
          <Text color="gray.500" size="lg" textAlign="center">
            Typebot makes form building easy and comes with powerful features
          </Text>
          <SimpleGrid columns={[1, 3]} spacing="10" pt="10">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </SimpleGrid>
        </VStack>
      </Stack>
    </Flex>
  )
}
