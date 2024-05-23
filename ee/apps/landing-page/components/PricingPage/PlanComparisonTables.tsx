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
  HStack,
  Tooltip,
  chakra,
  Button,
  Heading,
} from '@chakra-ui/react'
import { CheckIcon } from 'assets/icons/CheckIcon'
import { HelpCircleIcon } from 'assets/icons/HelpCircleIcon'
import { Plan } from '@typebot.io/prisma'
import Link from 'next/link'
import React from 'react'
import { parseNumberWithCommas } from '@typebot.io/lib'
import { chatsLimits, prices, seatsLimits } from '@typebot.io/billing/constants'
import { formatPrice } from '@typebot.io/billing/helpers/formatPrice'

type Props = {
  onChatsTiersClick: () => void
}

export const PlanComparisonTables = ({ onChatsTiersClick }: Props) => (
  <Stack spacing="12">
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th fontWeight="bold" color="white" w="400px">
              Usage
            </Th>
            <Th>Free</Th>
            <Th color="orange.200">Starter</Th>
            <Th color="blue.200">Pro</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Total bots</Td>
            <Td>Unlimited</Td>
            <Td>Unlimited</Td>
            <Td>Unlimited</Td>
          </Tr>
          <Tr>
            <Td>Chats</Td>
            <Td>{chatsLimits.FREE} / month</Td>
            <Td>{parseNumberWithCommas(chatsLimits.STARTER)} / month</Td>
            <Td>{parseNumberWithCommas(chatsLimits.PRO)} / month</Td>
          </Tr>
          <Tr>
            <Td>Additional Chats</Td>
            <Td />
            <Td>{formatPrice(10)} per 500 chats</Td>
            <Td>
              <Button
                variant="outline"
                size="xs"
                onClick={onChatsTiersClick}
                colorScheme="gray"
              >
                See tiers
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Td>Storage</Td>
            <Td />
            <Td>2 GB</Td>
            <Td>10 GB</Td>
          </Tr>
          <Tr>
            <Td>Members</Td>
            <Td>Just you</Td>
            <Td>{seatsLimits.STARTER} seats</Td>
            <Td>{seatsLimits.PRO} seats</Td>
          </Tr>
          <Tr>
            <Td>Guests</Td>
            <Td>Unlimited</Td>
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
            <Th>Free</Th>
            <Th color="orange.200">Starter</Th>
            <Th color="blue.200">Pro</Th>
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
            <Td>File upload inputs</Td>
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
            <Td>WhatsApp integration</Td>
            <Td />
            <Td />
            <Td>
              <CheckIcon />
            </Td>
          </Tr>
          <Tr>
            <Td>Custom domains</Td>
            <Td />
            <Td />
            <Td>Unlimited</Td>
          </Tr>
          <Tr>
            <TdWithTooltip
              text="In-depth analytics"
              tooltip="Analytics graph that shows your form drop-off rate, submission rate, and more."
            />
            <Td />
            <Td />
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
            <Th>Free</Th>
            <Th color="orange.200">Starter</Th>
            <Th color="blue.200">Pro</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Community support</Td>
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
            <Td>Direct support channel</Td>
            <Td />
            <Td>
              <CheckIcon />
            </Td>
            <Td>
              <CheckIcon />
            </Td>
          </Tr>
          <Tr>
            <Td>Priority support</Td>
            <Td />
            <Td />
            <Td>
              <CheckIcon />
            </Td>
          </Tr>
          <Tr>
            <Td>Feature request priority</Td>
            <Td />
            <Td />
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
        <Link href="https://app.typebot.io/register">
          <Button variant="outline" colorScheme="gray">
            Get started
          </Button>
        </Link>
      </Stack>
      <Stack spacing={4}>
        <Heading as="h3" size="md" color="orange.200">
          Starter
        </Heading>
        <Heading as="h3">
          {formatPrice(prices.STARTER)}{' '}
          <chakra.span fontSize="lg">/ month</chakra.span>
        </Heading>
        <Link
          href={`https://app.typebot.io/register?subscribePlan=${Plan.STARTER}`}
        >
          <Button variant="outline" colorScheme="orange">
            Subscribe
          </Button>
        </Link>
      </Stack>
      <Stack spacing={4}>
        <Heading as="h3" size="md" color="blue.200">
          Pro
        </Heading>
        <Heading as="h3">
          {formatPrice(prices.PRO)}{' '}
          <chakra.span fontSize="lg">/ month</chakra.span>
        </Heading>
        <Link
          href={`https://app.typebot.io/register?subscribePlan=${Plan.PRO}`}
        >
          <Button>Subscribe</Button>
        </Link>
      </Stack>
    </Stack>
  </Stack>
)

const TdWithTooltip = ({
  text,
  tooltip,
}: {
  text: string
  tooltip: string
}) => (
  <HStack as={Td}>
    <Text>{text}</Text>
    <Tooltip hasArrow placement="top" label={tooltip}>
      <chakra.span cursor="pointer">
        <HelpCircleIcon />
      </chakra.span>
    </Tooltip>
  </HStack>
)
