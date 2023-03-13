import { DropdownList } from '@/components/DropdownList'
import { TableList } from '@/components/TableList'
import {
  chatCompletionModels,
  ChatCompletionOpenAIOptions,
} from 'models/features/blocks/integrations/openai'
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
  const updateModel = (model: (typeof chatCompletionModels)[number]) => {
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
      <Accordion allowToggle allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Text w="full" textAlign="left">
              Messages
            </Text>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <TableList
              initialItems={options.messages}
              Item={ChatCompletionMessageItem}
              onItemsChange={updateMessages}
              isOrdered
              addLabel="Add message"
            />
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
            <DropdownList
              currentItem={options.model}
              items={chatCompletionModels}
              onItemSelect={updateModel}
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

          <AccordionPanel>
            <TableList
              initialItems={options.responseMapping}
              Item={ChatCompletionResponseItem}
              onItemsChange={updateResponseMapping}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
