import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Stack,
  Heading,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useResults } from '../ResultsProvider'
import React from 'react'
import { byId, isDefined } from '@typebot.io/lib'
import { HeaderIcon } from './HeaderIcon'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { parseColumnsOrder } from '@typebot.io/results/parseColumnsOrder'

type Props = {
  resultId: string | null
  onClose: () => void
}

export const ResultModal = ({ resultId, onClose }: Props) => {
  const { tableData, resultHeader } = useResults()
  const { typebot } = useTypebot()
  const result = isDefined(resultId)
    ? tableData.find((data) => data.id.plainText === resultId)
    : undefined

  const columnsOrder = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader
  )

  const getHeaderValue = (
    val: string | { plainText: string; element?: JSX.Element | undefined }
  ) => (typeof val === 'string' ? val : val.element ?? val.plainText)

  return (
    <Modal isOpen={isDefined(result)} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} p="10" spacing="10">
          {columnsOrder.map((headerId) => {
            if (!result || !result[headerId]) return null
            const header = resultHeader.find(byId(headerId))
            if (!header) return null
            return (
              <Stack key={header.id} spacing="4">
                <HStack>
                  <HeaderIcon header={header} />
                  <Heading fontSize="md">{header.label}</Heading>
                </HStack>
                <Text whiteSpace="pre-wrap" textAlign="justify">
                  {getHeaderValue(result[header.id])}
                </Text>
              </Stack>
            )
          })}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
