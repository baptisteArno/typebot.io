import {
  Stack,
  Heading,
  Checkbox,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { DownloadIcon, FileIcon } from '@/components/icons'
import { Workspace } from 'db'
import Link from 'next/link'
import React from 'react'
import { useInvoicesQuery } from './queries/useInvoicesQuery'

type Props = {
  workspace: Workspace
}

export const InvoicesList = ({ workspace }: Props) => {
  const { invoices, isLoading } = useInvoicesQuery(workspace.stripeId)

  return (
    <Stack spacing={6}>
      <Heading fontSize="3xl">Invoices</Heading>
      {invoices.length === 0 && !isLoading ? (
        <Text>No invoices found for this workspace.</Text>
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th w="0" />
                <Th>#</Th>
                <Th>Paid at</Th>
                <Th>Subtotal</Th>
                <Th w="0" />
              </Tr>
            </Thead>
            <Tbody>
              {invoices?.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td>
                    <FileIcon />
                  </Td>
                  <Td>{invoice.id}</Td>
                  <Td>{new Date(invoice.date * 1000).toDateString()}</Td>
                  <Td>{getFormattedPrice(invoice.amount, invoice.currency)}</Td>
                  <Td>
                    <IconButton
                      as={Link}
                      size="xs"
                      icon={<DownloadIcon />}
                      variant="outline"
                      href={invoice.url}
                      target="_blank"
                      aria-label={'Download invoice'}
                    />
                  </Td>
                </Tr>
              ))}
              {isLoading &&
                Array.from({ length: 3 }).map((_, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Checkbox isDisabled />
                    </Td>
                    <Td>
                      <Skeleton h="5px" />
                    </Td>
                    <Td>
                      <Skeleton h="5px" />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  )
}

const getFormattedPrice = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })

  return formatter.format(amount / 100)
}
