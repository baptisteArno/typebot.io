import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const proChatTiers = [
  {
    up_to: 'inf',
    unit_amount_decimal: '0.442',
  },
]

export const ChatsProTiersModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslate()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{t('billing.tiersModal.heading')}</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th isNumeric>Max chats</Th>
                  <Th isNumeric>Price per month</Th>
                  <Th isNumeric>Price per 1k chats</Th>
                </Tr>
              </Thead>
              <Tbody>
                {proChatTiers.map((tier) => {
                  return (
                    <Tr key={tier.up_to}>
                      <Td isNumeric>
                        {tier.up_to === 'inf'
                          ? '2,000,000+'
                          : tier.up_to.toLocaleString()}
                      </Td>
                      <Td isNumeric>{'included'}</Td>
                      <Td isNumeric>{'included'}</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
