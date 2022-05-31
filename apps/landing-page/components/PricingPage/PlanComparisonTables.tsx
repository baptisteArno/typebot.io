import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  Stack,
  StackProps,
  HStack,
  Tooltip,
  chakra,
  Button,
  Heading,
} from '@chakra-ui/react'
import { CheckIcon } from 'assets/icons/CheckIcon'
import { HelpCircleIcon } from 'assets/icons/HelpCircleIcon'
import { NextChakraLink } from 'components/common/nextChakraAdapters/NextChakraLink'
import React from 'react'

type Props = {
  prices: {
    personalPro: '$39' | '39€' | ''
    team: '$99' | '99€' | ''
  }
} & StackProps

export const PlanComparisonTables = ({ prices, ...props }: Props) => {
  return (
    <Stack spacing="12" {...props}>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th fontWeight="bold" color="white" w="400px">
                Usage
              </Th>
              <Th>Personal</Th>
              <Th color="orange.200">Personal Pro</Th>
              <Th color="purple.200">Team</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Forms</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <Td>Form submissions</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <Td>Members</Td>
              <Td>Just you</Td>
              <Td>Just you</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <Td>Guests</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <Td>File uploads</Td>
              <Td>5 MB</Td>
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th fontWeight="bold" color="white" w="400px">
                Features
              </Th>
              <Th>Personal</Th>
              <Th color="orange.200">Personal Pro</Th>
              <Th color="purple.200">Team</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <TdWithTooltip
                text="20+ blocks"
                tooltip="Includes display bubbles (text, image, video, embed), question inputs (email, url, phone number...) and logic blocks (conditions, set variables...)"
              />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Starter templates</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Webhooks</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Google Sheets</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Google Analytics</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Send emails</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Zapier</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Pabbly Connect</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Make.com</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Custom Javascript & CSS</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Export CSV</Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Custom domains</Td>
              <Td />
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <TdWithTooltip
                text="Folders"
                tooltip="Organize your typebots into folders"
              />
              <Td />
              <Td>Unlimited</Td>
              <Td>Unlimited</Td>
            </Tr>
            <Tr>
              <Td>Remove branding</Td>
              <Td />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <TdWithTooltip
                text="Incomplete submissions"
                tooltip="You get to see the form submission even if it was not fully completed by your user."
              />
              <Td />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <TdWithTooltip
                text="In-depth analytics"
                tooltip="Analytics graph that shows your form drop-off rate, submission rate, and more."
              />
              <Td />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th fontWeight="bold" color="white" w="400px">
                Support
              </Th>
              <Th>Personal</Th>
              <Th color="orange.200">Personal Pro</Th>
              <Th color="purple.200">Team</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Priority support</Td>
              <Td />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
            <Tr>
              <Td>Feature request priority</Td>
              <Td />
              <Td>
                <CheckIcon />
              </Td>
              <Td>
                <CheckIcon />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Stack
        direction={['column', 'row']}
        spacing={4}
        w="full"
        justify="space-around"
      >
        <Stack spacing={4}>
          <Heading as="h3" size="md">
            Personal
          </Heading>
          <Heading as="h3">Free</Heading>
          <NextChakraLink
            href="https://app.typebot.io/register"
            _hover={{ textDecor: 'none' }}
          >
            <Button variant="outline">Get started</Button>
          </NextChakraLink>
        </Stack>
        <Stack spacing={4}>
          <Heading as="h3" size="md" color="orange.200">
            Personal Pro
          </Heading>
          <Heading as="h3">
            {prices.personalPro}{' '}
            <chakra.span fontSize="lg">/ month</chakra.span>
          </Heading>
          <NextChakraLink
            href="https://app.typebot.io/register?subscribePlan=pro"
            _hover={{ textDecor: 'none' }}
          >
            <Button>Subscribe</Button>
          </NextChakraLink>
        </Stack>
        <Stack spacing={4}>
          <Heading as="h3" size="md" color="purple.200">
            Team
          </Heading>
          <Heading as="h3">
            {prices.team} <chakra.span fontSize="lg">/ month</chakra.span>
          </Heading>
          <NextChakraLink
            href="https://app.typebot.io/register?subscribePlan=team"
            _hover={{ textDecor: 'none' }}
          >
            <Button>Subscribe</Button>
          </NextChakraLink>
        </Stack>
      </Stack>
    </Stack>
  )
}

const TdWithTooltip = ({
  text,
  tooltip,
}: {
  text: string
  tooltip: string
}) => (
  <Td as={HStack}>
    <Text>{text}</Text>
    <Tooltip hasArrow placement="top" label={tooltip}>
      <chakra.span cursor="pointer">
        <HelpCircleIcon />
      </chakra.span>
    </Tooltip>
  </Td>
)
