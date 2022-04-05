import {
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { Typebot } from 'models'
import React, { useEffect, useState } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { sendRequest } from 'utils'
import { TemplateProps, templates } from './data'

type Props = { isOpen: boolean; onClose: () => void }

export const TemplatesModal = ({ isOpen, onClose }: Props) => {
  const [typebot, setTypebot] = useState<Typebot>()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    fetchTemplate(templates[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTemplate = async (template: TemplateProps) => {
    const { data, error } = await sendRequest(`/templates/${template.fileName}`)
    if (error) return toast({ title: error.name, description: error.message })
    setTypebot(data as Typebot)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader as={HStack} justifyContent="space-between" w="full">
          <Heading fontSize="xl">Lead generation</Heading>
        </ModalHeader>
        <ModalBody as={HStack}>
          {typebot && (
            <TypebotViewer typebot={parseTypebotToPublicTypebot(typebot)} />
          )}
          <Stack>
            <Button colorScheme="blue">Use this template</Button>
          </Stack>
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
