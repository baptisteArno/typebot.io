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
import { isDefined } from '@typebot.io/lib'
import { HeaderIcon } from '../utils'

type Props = {
  resultIdx: number | null
  onClose: () => void
}

export const ResultModal = ({ resultIdx, onClose }: Props) => {
  const { tableData, resultHeader } = useResults()
  const result = isDefined(resultIdx) ? tableData[resultIdx] : undefined

  const getHeaderValue = (
    val: string | { plainText: string; element?: JSX.Element | undefined }
  ) => (typeof val === 'string' ? val : val.element ?? val.plainText)

  return (
    <Modal isOpen={isDefined(result)} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} p="10" spacing="10">
          {resultHeader.map((header) =>
            result && result[header.label] ? (
              <Stack key={header.id} spacing="4">
                <HStack>
                  <HeaderIcon header={header} />
                  <Heading fontSize="md">{header.label}</Heading>
                </HStack>
                <Text whiteSpace="pre-wrap" textAlign="justify">
                  {getHeaderValue(result[header.label])}
                </Text>
              </Stack>
            ) : null
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
