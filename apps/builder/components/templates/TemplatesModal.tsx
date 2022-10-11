import {
  Button,
  chakra,
  Divider,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from 'assets/icons'
import { TypebotViewer } from 'bot-engine'
import { Typebot } from 'models'
import React, { useEffect, useState } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { sendRequest } from 'utils'
import { TemplateProps, templates } from './data'

type Props = {
  isOpen: boolean
  onClose: () => void
  onTypebotChoose: (typebot: Typebot) => void
}

export const TemplatesModal = ({ isOpen, onClose, onTypebotChoose }: Props) => {
  const [typebot, setTypebot] = useState<Typebot>()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(
    templates[0]
  )
  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    fetchTemplate(templates[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTemplate = async (template: TemplateProps) => {
    setSelectedTemplate(template)
    const { data, error } = await sendRequest(`/templates/${template.fileName}`)
    if (error) return toast({ title: error.name, description: error.message })
    setTypebot(data as Typebot)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalBody as={HStack} p="0">
          <Stack w="full" h="full">
            <Heading pl="10" pt="4" fontSize="2xl">
              {selectedTemplate.emoji}{' '}
              <chakra.span ml="2">{selectedTemplate.name}</chakra.span>
            </Heading>
            {typebot && (
              <TypebotViewer
                typebot={parseTypebotToPublicTypebot(typebot)}
                key={typebot.id}
              />
            )}
          </Stack>

          <Stack
            h="full"
            py="6"
            w="300px"
            px="4"
            borderLeftWidth={1}
            justify="space-between"
          >
            <Stack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={() => {
                  if (typebot) {
                    onTypebotChoose(typebot)
                    setIsLoading(true)
                  }
                  return typebot
                }
                }
                isLoading={isLoading}
              >
                Use this template
              </Button>
              <Divider />
              <Stack>
                {templates.map((template) => (
                  <Tooltip
                    key={template.name}
                    isDisabled={!template.isComingSoon}
                    label="Coming soon!"
                  >
                    <span>
                      <Button
                        onClick={() => fetchTemplate(template)}
                        w="full"
                        variant={
                          selectedTemplate.name === template.name
                            ? 'solid'
                            : 'ghost'
                        }
                        isDisabled={template.isComingSoon}
                      >
                        {template.emoji}{' '}
                        <chakra.span minW="200px" textAlign="left" ml="3">
                          {template.name}
                        </chakra.span>
                      </Button>
                    </span>
                  </Tooltip>
                ))}
              </Stack>
            </Stack>

            <Stack>
              <Divider />
              <Tooltip label="Coming soon!" placement="top">
                <span>
                  <Button
                    w="full"
                    variant="ghost"
                    isDisabled
                    leftIcon={<ExternalLinkIcon />}
                  >
                    Community templates
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
