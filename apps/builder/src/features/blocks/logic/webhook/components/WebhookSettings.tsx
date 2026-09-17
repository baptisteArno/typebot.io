import { CopyButton } from '@/components/CopyButton'
import { TableList, TableListItemProps } from '@/components/TableList'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { DataVariableInputs } from '@/features/blocks/integrations/webhook/components/ResponseMappingInputs'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Code,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
} from '@chakra-ui/react'
import { env } from '@typebot.io/env'
import { ResponseVariableMapping, WebhookBlock } from '@typebot.io/schemas'
import React, { useMemo } from 'react'

type Props = {
  blockId: string
  options: WebhookBlock['options']
  onOptionsChange: (options: WebhookBlock['options']) => void
}

export const WebhookSettings = ({
  blockId,
  options,
  onOptionsChange,
}: Props) => {
  const { typebot } = useTypebot()

  const urlBase = typebot
    ? `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/v1/typebots/${typebot.id}/blocks/${blockId}`
    : ''
  const resultIdUrl = `${urlBase}/results/{resultId}/executeWebhook`
  const externalIdUrl = `${urlBase}/external/{externalId}/executeWebhook`

  const updateResponseVariableMapping = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => onOptionsChange({ ...options, responseVariableMapping })

  const updateExternalIdVariableId = (variable: { id: string } | undefined) =>
    onOptionsChange({ ...options, externalIdVariableId: variable?.id })

  const ResponseMappingInputs = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <DataVariableInputs {...props} dataItems={[]} />
      },
    []
  )

  return (
    <Stack spacing="4">
      <Tabs size="sm" variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>By result ID</Tab>
          <Tab>By external ID</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px="0">
            <Stack spacing="4">
              <Text fontSize="sm">
                The conversation pauses here until an external service sends an
                authenticated <Tag size="sm">POST</Tag> request to this URL. Use
                this when you already have a resultId from your own{' '}
                <Code fontSize="xs">/startChat</Code> call — this URL only
                resumes, it never starts a new conversation.
              </Text>
              {typebot && (
                <FormControl as={Stack}>
                  <InputGroup size="sm">
                    <Input type="text" readOnly value={resultIdUrl} />
                    <InputRightElement width="60px">
                      <CopyButton size="sm" textToCopy={resultIdUrl} />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText mt="0">
                    Replace <Code fontSize="xs">{'{resultId}'}</Code> with the
                    current result ID, which you can read into a variable with a
                    Set variable block.
                  </FormHelperText>
                </FormControl>
              )}
            </Stack>
          </TabPanel>
          <TabPanel px="0">
            <Stack spacing="4">
              <Text fontSize="sm">
                Calling this URL both starts and resumes conversations,
                identified by an ID you choose — a phone number, a lead ID,
                anything from your own system. First call with a given ID:
                starts a new conversation, entering right where this block
                connects to. Later calls with the SAME ID: resume it. No prior
                contact or resultId is needed.
              </Text>
              {typebot && (
                <FormControl as={Stack}>
                  <InputGroup size="sm">
                    <Input type="text" readOnly value={externalIdUrl} />
                    <InputRightElement width="60px">
                      <CopyButton size="sm" textToCopy={externalIdUrl} />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText mt="0">
                    Replace <Code fontSize="xs">{'{externalId}'}</Code> with
                    your own identifier for this contact. The typebot must be
                    published, and this block must have an outgoing connection
                    to a group.
                  </FormHelperText>
                </FormControl>
              )}
              <FormControl>
                <FormLabel htmlFor="externalIdVariable" fontSize="sm">
                  Save external ID as variable:
                </FormLabel>
                <VariableSearchInput
                  initialVariableId={options?.externalIdVariableId}
                  onSelectVariable={updateExternalIdVariableId}
                  placeholder="Search for a variable"
                />
              </FormControl>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Text fontSize="xs" color="gray.500">
        Both URLs need an <Code fontSize="xs">Authorization</Code> header
        matching the server&apos;s <Code fontSize="xs">WEBHOOK_TOKEN</Code>.
      </Text>

      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Save in variables
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pt="4">
            <Stack spacing="4">
              <Text fontSize="sm" color="gray.500">
                The received body is available as{' '}
                <Code fontSize="xs">data</Code>. For a payload like{' '}
                <Code fontSize="xs">{'{ "order": { "id": 12 } }'}</Code>, use{' '}
                <Code fontSize="xs">data.order.id</Code>. This mapping applies
                whether the call resumes an existing conversation or starts a
                new one via the external ID URL above.
              </Text>
              <TableList<ResponseVariableMapping>
                initialItems={options?.responseVariableMapping}
                onItemsChange={updateResponseVariableMapping}
                addLabel="Add an entry"
              >
                {(props) => <ResponseMappingInputs {...props} />}
              </TableList>
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
