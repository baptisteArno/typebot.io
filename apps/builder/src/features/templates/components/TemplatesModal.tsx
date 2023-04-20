import {
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Tag,
  Text,
  chakra,
  useColorModeValue,
} from '@chakra-ui/react'
import { Standard } from '@typebot.io/react'
import { Typebot } from '@typebot.io/schemas'
import React, { useCallback, useEffect, useState } from 'react'
import { templates } from '../data'
import { TemplateProps } from '../types'
import { useToast } from '@/hooks/useToast'
import { sendRequest } from '@typebot.io/lib'

type Props = {
  isOpen: boolean
  onClose: () => void
  onTypebotChoose: (typebot: Typebot) => void
}

export const TemplatesModal = ({ isOpen, onClose, onTypebotChoose }: Props) => {
  const templateCardBackgroundColor = useColorModeValue(undefined, 'gray.800')
  const [typebot, setTypebot] = useState<Typebot>()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(
    templates[0]
  )
  const [isLoading, setIsLoading] = useState(false)

  const { showToast } = useToast()

  const fetchTemplate = useCallback(
    async (template: TemplateProps) => {
      setSelectedTemplate(template)
      const { data, error } = await sendRequest(
        `/templates/${template.fileName}`
      )
      if (error)
        return showToast({ title: error.name, description: error.message })
      setTypebot(data as Typebot)
    },
    [showToast]
  )

  useEffect(() => {
    fetchTemplate(templates[0])
  }, [fetchTemplate])

  const onUseThisTemplateClick = () => {
    if (!typebot) return
    onTypebotChoose(typebot)
    setIsLoading(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      blockScrollOnMount={false}
      size="6xl"
    >
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalBody h="full" as={HStack} p="0" spacing="0">
          <Stack
            h="full"
            w="300px"
            py="4"
            px="2"
            borderRightWidth={1}
            justify="space-between"
            flexShrink={0}
          >
            <Stack spacing={5}>
              <Stack spacing={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  pl="1"
                  color="gray.500"
                >
                  Marketing
                </Text>
                {templates
                  .filter((template) => template.category === 'marketing')
                  .map((template) => (
                    <Button
                      size="sm"
                      key={template.name}
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant={
                        selectedTemplate.name === template.name
                          ? 'solid'
                          : 'ghost'
                      }
                      isDisabled={template.isComingSoon}
                    >
                      <HStack overflow="hidden" fontSize="sm" w="full">
                        <Text>{template.emoji}</Text>
                        <Text>{template.name}</Text>
                        {template.isNew && (
                          <Tag colorScheme="orange" size="sm" flexShrink={0}>
                            New
                          </Tag>
                        )}
                      </HStack>
                    </Button>
                  ))}
              </Stack>
              <Stack spacing={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  pl="1"
                  color="gray.500"
                >
                  Product
                </Text>
                {templates
                  .filter((template) => template.category === 'product')
                  .map((template) => (
                    <Button
                      size="sm"
                      key={template.name}
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant={
                        selectedTemplate.name === template.name
                          ? 'solid'
                          : 'ghost'
                      }
                      isDisabled={template.isComingSoon}
                    >
                      <HStack overflow="hidden" fontSize="sm" w="full">
                        <Text>{template.emoji}</Text>
                        <Text>{template.name}</Text>
                        {template.isNew && (
                          <Tag colorScheme="orange" size="sm" flexShrink={0}>
                            New
                          </Tag>
                        )}
                      </HStack>
                    </Button>
                  ))}
              </Stack>
              <Stack spacing={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  pl="1"
                  color="gray.500"
                >
                  Other
                </Text>
                {templates
                  .filter((template) => template.category === undefined)
                  .map((template) => (
                    <Button
                      size="sm"
                      key={template.name}
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant={
                        selectedTemplate.name === template.name
                          ? 'solid'
                          : 'ghost'
                      }
                      isDisabled={template.isComingSoon}
                    >
                      <HStack overflow="hidden" fontSize="sm" w="full">
                        <Text>{template.emoji}</Text>
                        <Text>{template.name}</Text>
                        {template.isNew && (
                          <Tag colorScheme="orange" size="sm" flexShrink={0}>
                            New
                          </Tag>
                        )}
                      </HStack>
                    </Button>
                  ))}
              </Stack>
            </Stack>
          </Stack>
          <Stack
            w="full"
            h="full"
            spacing="4"
            align="center"
            pb="4"
            bgColor="white"
          >
            {typebot && (
              <Standard
                key={typebot.id}
                typebot={typebot}
                style={{
                  borderRadius: '0.25rem',
                  backgroundColor: '#fff',
                }}
              />
            )}
            <HStack
              p="6"
              borderWidth={1}
              rounded="md"
              w="95%"
              spacing={4}
              bgColor={templateCardBackgroundColor}
            >
              <Stack flex="1" spacing={4}>
                <Heading fontSize="2xl">
                  {selectedTemplate.emoji}{' '}
                  <chakra.span ml="2">{selectedTemplate.name}</chakra.span>
                </Heading>
                <Text>{selectedTemplate.description}</Text>
              </Stack>
              <Button
                colorScheme="blue"
                onClick={onUseThisTemplateClick}
                isLoading={isLoading}
              >
                Use this template
              </Button>
            </HStack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
