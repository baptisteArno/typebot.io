import { AlertInfo } from '@/components/AlertInfo'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { TextLink } from '@/components/TextLink'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  OrderedList,
  ListItem,
  Code,
  ModalFooter,
  Text,
  Stack,
} from '@chakra-ui/react'
import { ModalProps } from '../EmbedButton'
import { parseApiHost } from '../snippetParsers/shared'
import { useSniper } from '@/features/editor/providers/SniperProvider'

export const ApiModal = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: ModalProps): JSX.Element => {
  const { sniper } = useSniper()

  const replyBody = `{
  "message": "This is my reply"
}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">API</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          {!isPublished && (
            <AlertInfo>You need to publish your bot first.</AlertInfo>
          )}
          <OrderedList spacing={4} pl="4">
            <ListItem>
              <Stack>
                <Text>
                  To start the chat, send a <Code>POST</Code> request to
                </Text>
                <CodeEditor
                  isReadOnly
                  lang={'shell'}
                  value={`${parseApiHost(
                    sniper?.customDomain
                  )}/api/v1/snipers/${publicId}/startChat`}
                />
              </Stack>
            </ListItem>
            <ListItem>
              The first response will contain a <Code>sessionId</Code> that you
              will need for subsequent requests.
            </ListItem>
            <ListItem>
              <Stack>
                <Text>
                  To send replies, send <Code>POST</Code> requests to
                </Text>
                <CodeEditor
                  isReadOnly
                  lang={'shell'}
                  value={`${parseApiHost(
                    sniper?.customDomain
                  )}/api/v1/sessions/<ID_FROM_FIRST_RESPONSE>/continueChat`}
                />
                <Text>With the following JSON body:</Text>
                <CodeEditor isReadOnly lang={'json'} value={replyBody} />
                <Text>
                  Replace <Code>{'<ID_FROM_FIRST_RESPONSE>'}</Code> with{' '}
                  <Code>sessionId</Code>.
                </Text>
              </Stack>
            </ListItem>
          </OrderedList>
          <Text fontSize="sm" colorScheme="gray">
            Check out the{' '}
            <TextLink
              href="https://docs.sniper.io/api-reference/chat/start-chat"
              isExternal
            >
              API reference
            </TextLink>{' '}
            for more information
          </Text>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
