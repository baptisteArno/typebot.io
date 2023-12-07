import { TableList } from '@/components/TableList'
import { ChatCompletionOpenAIOptions } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { ChatCompletionMessageItem } from './ChatCompletionMessageItem'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  Text,
} from '@chakra-ui/react'
import { TextLink } from '@/components/TextLink'
import { ChatCompletionResponseItem } from './ChatCompletionResponseItem'
import { NumberInput } from '@/components/inputs'
import { ModelsDropdown } from '../ModelsDropdown'

const apiReferenceUrl =
  'https://platform.openai.com/docs/api-reference/chat/create'

type Props = {
  options: ChatCompletionOpenAIOptions
  onOptionsChange: (options: ChatCompletionOpenAIOptions) => void
}

export const OpenAIChatCompletionSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const updateModel = (model: string | undefined) => {
    if (!model) return
    onOptionsChange({
      ...options,
      model,
    })
  }

  const updateMessages = (messages: typeof options.messages) => {
    onOptionsChange({
      ...options,
      messages,
    })
  }

  const updateTemperature = (
    temperature: number | `{{${string}}}` | undefined
  ) => {
    onOptionsChange({
      ...options,
      advancedSettings: {
        ...options.advancedSettings,
        temperature,
      },
    })
  }

  const updateResponseMapping = (
    responseMapping: typeof options.responseMapping
  ) => {
    onOptionsChange({
      ...options,
      responseMapping,
    })
  }

  return (
    <Stack spacing={4} pt="2">
      <Text fontSize="sm" color="gray.500">
        Read the{' '}
        <TextLink href={apiReferenceUrl} isExternal>
          API reference
        </TextLink>{' '}
        to better understand the available options.
      </Text>
      {options.credentialsId && (
        <>
          <ModelsDropdown
            credentialsId={options.credentialsId}
            defaultValue={options.model}
            baseUrl={options.baseUrl}
            apiVersion={options.apiVersion}
            type="gpt"
            onChange={updateModel}
          />
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Messages
                </Text>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel pt="4">
                <TableList
                  initialItems={options.messages}
                  onItemsChange={updateMessages}
                  isOrdered
                  hasDefaultItem
                  addLabel="Add message"
                >
                  {(props) => <ChatCompletionMessageItem {...props} />}
                </TableList>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Advanced settings
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <NumberInput
                  label="Temperature"
                  placeholder="1"
                  max={2}
                  min={0}
                  step={0.1}
                  defaultValue={options.advancedSettings?.temperature}
                  onValueChange={updateTemperature}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Save answer
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pt="4">
                <TableList
                  initialItems={options.responseMapping}
                  onItemsChange={updateResponseMapping}
                  newItemDefaultProps={{ valueToExtract: 'Message content' }}
                  hasDefaultItem
                >
                  {(props) => <ChatCompletionResponseItem {...props} />}
                </TableList>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </Stack>
  )
}
