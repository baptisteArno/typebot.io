import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Stack,
  Heading,
  List,
  ListItem,
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useTranslate } from '@tolgee/react'
import { TextLink } from '@/components/TextLink'
import { T } from '@tolgee/react'

export const GettingStartedModal = () => {
  const { t } = useTranslate()
  const { query } = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (query.isFirstBot) onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="8" py="10">
          <Stack spacing={8}>
            <Heading fontSize="xl">
              {t('editor.gettingStartedModal.editorBasics.heading')}
            </Heading>
            <List spacing={4}>
              <HStack as={ListItem} alignItems="top" spacing={4}>
                <Flex
                  bgColor="customPink.600"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                  marginTop="3px"
                >
                  1
                </Flex>
                <Text>
                  {t('editor.gettingStartedModal.editorBasics.list.one.label')}
                </Text>
              </HStack>
              <HStack as={ListItem} alignItems="top" spacing={4}>
                <Flex
                  bgColor="customPink.600"
                  rounded="full"
                  boxSize="25px"
                  fontSize="13px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  marginTop="3px"
                >
                  2
                </Flex>
                <Text>
                  {t('editor.gettingStartedModal.editorBasics.list.two.label')}
                </Text>
              </HStack>
              <HStack as={ListItem} alignItems="top" spacing={4}>
                <Flex
                  bgColor="customPink.600"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                  marginTop="2px"
                >
                  3
                </Flex>
                <Text>
                  {t(
                    'editor.gettingStartedModal.editorBasics.list.three.label'
                  )}
                </Text>
              </HStack>
              <HStack as={ListItem} alignItems="top" spacing={4}>
                <Flex
                  bgColor="customPink.600"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                  marginTop="3px"
                >
                  4
                </Flex>
                <Text>
                  {t('editor.gettingStartedModal.editorBasics.list.four.label')}
                </Text>
              </HStack>
            </List>
          </Stack>

          <Text>
            <T
              keyName="editor.gettingStartedModal.editorBasics.list.label"
              params={{
                documentation: (
                  <TextLink
                    href={'https://docs.typebot.io/get-started/introduction'}
                    color="customBlue.500"
                    fontWeight={700}
                    isExternal={true}
                  />
                ),
              }}
            />
          </Text>

          <Stack spacing={4}>
            <Heading fontSize="l">
              {t('editor.gettingStartedModal.seeAction.label')}
            </Heading>
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/jp3ggg_42-M"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '0.5rem', border: 'none' }}
            />
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {t('editor.gettingStartedModal.seeAction.item.label')}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel py={10} as={Stack} spacing="10">
                  <iframe
                    width="100%"
                    height="315"
                    src="https://www.youtube.com/embed/6BudIC4GYNk"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '0.5rem', border: 'none' }}
                  />
                  <iframe
                    width="100%"
                    height="315"
                    src="https://www.youtube.com/embed/ZuyDwFLRbfQ"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '0.5rem', border: 'none' }}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {t('editor.gettingStartedModal.disclaimer.item.label')}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel py={4} as={Stack} spacing="10">
                  <Text>
                    <T
                      keyName="editor.gettingStartedModal.editorBasics.List.mention.label"
                      params={{
                        typebot: <TextLink href={'https://typebot.io'} />,
                      }}
                    />
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
