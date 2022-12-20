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

export const GettingStartedModal = () => {
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
          <Stack spacing={4}>
            <Heading fontSize="xl">Editor basics</Heading>
            <List spacing={4}>
              <HStack as={ListItem}>
                <Flex
                  bgColor="blue.500"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                >
                  1
                </Flex>
                <Text>
                  The left side bar contains blocks that you can drag and drop
                  to the board.
                </Text>
              </HStack>
              <HStack as={ListItem}>
                <Flex
                  bgColor="blue.500"
                  rounded="full"
                  boxSize="25px"
                  fontSize="13px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  2
                </Flex>
                <Text>
                  You can group blocks together by dropping them below or above
                  each other
                </Text>
              </HStack>
              <HStack as={ListItem}>
                <Flex
                  bgColor="blue.500"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                >
                  3
                </Flex>
                <Text>Connect the groups together</Text>
              </HStack>
              <HStack as={ListItem}>
                <Flex
                  bgColor="blue.500"
                  rounded="full"
                  boxSize="25px"
                  justify="center"
                  align="center"
                  color="white"
                  fontWeight="bold"
                  flexShrink={0}
                  fontSize="13px"
                >
                  4
                </Flex>
                <Text>
                  Preview your bot by clicking the preview button on the top
                  right
                </Text>
              </HStack>
            </List>
          </Stack>

          <Text>
            Feel free to use the bottom-right bubble to reach out if you have
            any question. I usually answer within the next 24 hours. 😃
          </Text>
          <Stack spacing={4}>
            <Heading fontSize="xl">See it in action ({`<`} 5 minutes)</Heading>
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
                    Other videos
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
            </Accordion>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
