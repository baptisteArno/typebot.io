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
import { proChatTiers } from '@typebot.io/billing/constants'
import { formatPrice } from '@typebot.io/billing/helpers/formatPrice'

type Props = {
  isOpen: boolean
  onClose: () => void
}

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
                {proChatTiers.map((tier, index) => {
                  const pricePerMonth =
                    (tier.flat_amount ??
                      proChatTiers.at(-2)?.flat_amount ??
                      0) / 100
                  return (
                    <Tr key={tier.up_to}>
                      <Td isNumeric>
                        {tier.up_to === 'inf'
                          ? '2,000,000+'
                          : tier.up_to.toLocaleString()}
                      </Td>
                      <Td isNumeric>
                        {index === 0 ? 'included' : formatPrice(pricePerMonth)}
                      </Td>
                      <Td isNumeric>
                        {index === proChatTiers.length - 1
                          ? formatPrice(4.42, { maxFractionDigits: 2 })
                          : index === 0
                          ? 'included'
                          : formatPrice(
                              (((pricePerMonth * 100) /
                                ((tier.up_to as number) -
                                  (proChatTiers.at(0)?.up_to as number))) *
                                1000) /
                                100,
                              { maxFractionDigits: 2 }
                            )}
                      </Td>
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
