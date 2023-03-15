import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  Stack,
  Input,
  HStack,
  Alert,
  ModalFooter,
  Button,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { useToast } from '@/hooks/useToast'
import { useEffect, useRef, useState } from 'react'
import { env, getViewerUrl } from '@typebot.io/lib'
import { createCustomDomainQuery } from '../queries/createCustomDomainQuery'

const hostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/

type CustomDomainModalProps = {
  workspaceId: string
  isOpen: boolean
  onClose: () => void
  domain?: string
  onNewDomain: (customDomain: string) => void
}

export const CustomDomainModal = ({
  workspaceId,
  isOpen,
  onClose,
  onNewDomain,
  domain = '',
}: CustomDomainModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(domain)
  const [hostname, setHostname] = useState({
    domain: splitHostname(domain)?.domain ?? '',
    subdomain: splitHostname(domain)?.subdomain ?? '',
  })

  const { showToast } = useToast()

  useEffect(() => {
    if (inputValue === '' || !isOpen) return
    if (!hostnameRegex.test(inputValue))
      return setHostname({ domain: '', subdomain: '' })
    const hostnameDetails = splitHostname(inputValue)
    if (!hostnameDetails) return setHostname({ domain: '', subdomain: '' })
    setHostname({
      domain: hostnameDetails.domain,
      subdomain: hostnameDetails.subdomain,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  const onAddDomainClick = async () => {
    if (!hostnameRegex.test(inputValue)) return
    setIsLoading(true)
    const { error } = await createCustomDomainQuery(workspaceId, {
      name: inputValue,
    })
    setIsLoading(false)
    if (error)
      return showToast({ title: error.name, description: error.message })
    onNewDomain(inputValue)
    onClose()
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      initialFocusRef={inputRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Add a custom domain</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="bot.my-domain.com"
            />
            {hostname.domain !== '' && (
              <>
                <Text>
                  Add the following record in your DNS provider to continue:
                </Text>
                {hostname.subdomain ? (
                  <HStack
                    bgColor="gray.700"
                    color="white"
                    rounded="md"
                    p={4}
                    spacing={8}
                  >
                    <Stack>
                      <Text fontWeight="bold">Type</Text>
                      <Text>CNAME</Text>
                    </Stack>
                    <Stack>
                      <Text fontWeight="bold">Name</Text>
                      <Text>{hostname.subdomain}</Text>
                    </Stack>
                    <Stack>
                      <Text fontWeight="bold">Value</Text>
                      <Text>
                        {
                          new URL(
                            env('VIEWER_INTERNAL_URL') ?? getViewerUrl() ?? ''
                          ).hostname
                        }
                      </Text>
                    </Stack>
                  </HStack>
                ) : (
                  <HStack
                    bgColor="gray.700"
                    color="white"
                    rounded="md"
                    p={4}
                    spacing={8}
                  >
                    <Stack>
                      <Text fontWeight="bold">Type</Text>
                      <Text>A</Text>
                    </Stack>
                    <Stack>
                      <Text fontWeight="bold">Name</Text>
                      <Text>@</Text>
                    </Stack>
                    <Stack>
                      <Text fontWeight="bold">Value</Text>
                      <Text>76.76.21.21</Text>
                    </Stack>
                  </HStack>
                )}
                <Alert rounded="md">
                  Depending on your provider, it might take some time for the
                  changes to apply
                </Alert>
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Tooltip
            label="Domain is invalid"
            isDisabled={hostname.domain !== ''}
          >
            <span>
              <Button
                onClick={onAddDomainClick}
                isDisabled={hostname.domain === ''}
                isLoading={isLoading}
                colorScheme="blue"
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const splitHostname = (
  hostname: string
): { domain: string; type: string; subdomain: string } | undefined => {
  if (!hostname.includes('.')) return
  const urlParts = /([a-z-0-9]{2,63}).([a-z.]{2,5})$/.exec(hostname)
  if (!urlParts) return
  const [, domain, type] = urlParts
  const subdomain = hostname.replace(`${domain}.${type}`, '').slice(0, -1)
  return {
    domain,
    type,
    subdomain,
  }
}
