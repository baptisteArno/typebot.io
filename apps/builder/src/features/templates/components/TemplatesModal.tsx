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
import { Standard } from '@sniper.io/nextjs'
import { Sniper } from '@sniper.io/schemas'
import React, { useCallback, useEffect, useState } from 'react'
import { useTemplates } from '../hooks/useTemplates'
import { TemplateProps } from '../types'
import { useToast } from '@/hooks/useToast'
import { sendRequest } from '@sniper.io/lib'
import { useTranslate } from '@tolgee/react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSniperChoose: (sniper: Sniper) => void
  isLoading: boolean
}

export const TemplatesModal = ({
  isOpen,
  onClose,
  onSniperChoose,
  isLoading,
}: Props) => {
  const { t } = useTranslate()
  const templateCardBackgroundColor = useColorModeValue('white', 'gray.800')
  const [sniper, setSniper] = useState<Sniper>()
  const templates = useTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(
    templates[0]
  )
  const [isFirstTemplateLoaded, setIsFirstTemplateLoaded] = useState(false)
  const { showToast } = useToast()

  const fetchTemplate = useCallback(
    async (template: TemplateProps) => {
      setSelectedTemplate(template)
      const { data, error } = await sendRequest(
        `/templates/${template.fileName}`
      )
      if (error)
        return showToast({ title: error.name, description: error.message })
      setSniper({ ...(data as Sniper), name: template.name })
    },
    [showToast]
  )

  useEffect(() => {
    if (isFirstTemplateLoaded) return
    setIsFirstTemplateLoaded(true)
    fetchTemplate(templates[0])
  }, [fetchTemplate, templates, isFirstTemplateLoaded])

  const onUseThisTemplateClick = async () => {
    if (!sniper) return
    onSniperChoose(sniper)
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
            overflowY="auto"
          >
            <Stack spacing={5}>
              <Stack spacing={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  pl="1"
                  color="gray.500"
                >
                  {t('templates.modal.menuHeading.whatsapp')}
                </Text>
                {templates
                  .filter((template) => template.category === 'whatsapp')
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
                            {t('templates.modal.menuHeading.new.tag')}
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
                  {t('templates.modal.menuHeading.instagram')}
                </Text>
                {templates
                  .filter((template) => template.category === 'instagram')
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
                            {t('templates.modal.menuHeading.new.tag')}
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
                  {t('templates.modal.menuHeading.marketing')}
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
                            {t('templates.modal.menuHeading.new.tag')}
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
                  {t('templates.modal.menuHeading.product')}
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
                            {t('templates.modal.menuHeading.new.tag')}
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
                  {t('templates.modal.menuHeading.other')}
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
                            {t('templates.modal.menuHeading.new.tag')}
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
            bgColor={selectedTemplate.backgroundColor ?? 'white'}
          >
            {sniper && (
              <Standard
                key={sniper.id}
                sniper={sniper}
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
                {t('templates.modal.useTemplateButton.label')}
              </Button>
            </HStack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
