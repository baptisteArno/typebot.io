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
  ListIcon,
  Text,
} from '@chakra-ui/react'
import { CheckSquareIcon } from 'assets/icons'
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
              <ListItem>
                <ListIcon as={CheckSquareIcon} color="blue.500" mb="0.5" />
                The left side bar contains blocks that you can drag and drop to
                the canva
              </ListItem>
              <ListItem>
                <ListIcon as={CheckSquareIcon} color="blue.500" mb="0.5" />
                You can group blocks together by dragging them below or above
                each other
              </ListItem>
              <ListItem>
                <ListIcon as={CheckSquareIcon} color="blue.500" mb="0.5" />
                Don't forget to connect blocks together
              </ListItem>
              <ListItem>
                <ListIcon as={CheckSquareIcon} color="blue.500" mb="0.5" />
                Preview your bot by clicking the preview button on the right
              </ListItem>
            </List>
          </Stack>

          <Text>
            Feel free to use the bottom-right bubble to contact if you have any
            question 😃
          </Text>
          <Stack spacing={4}>
            <Heading fontSize="xl">See it in action ({`<`} 5 minutes)</Heading>
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/jp3ggg_42-M"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '0.5rem' }}
            />
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
