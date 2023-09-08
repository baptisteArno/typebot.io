import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import {
  ChatCompletionOpenAIOptions,
  CreateImageOpenAIOptions,
  defaultBaseUrl,
  defaultChatCompletionOptions,
  OpenAIBlock,
  openAITasks,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { OpenAICredentialsModal } from './OpenAICredentialsModal'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { DropdownList } from '@/components/DropdownList'
import { OpenAIChatCompletionSettings } from './createChatCompletion/OpenAIChatCompletionSettings'
import { createId } from '@paralleldrive/cuid2'
import { TextInput } from '@/components/inputs'

type OpenAITask = (typeof openAITasks)[number]

type Props = {
  block: OpenAIBlock
  onOptionsChange: (options: OpenAIBlock['options']) => void
}

export const OpenAISettings = ({
  block: { options },
  onOptionsChange,
}: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const updateTask = (task: OpenAITask) => {
    switch (task) {
      case 'Create chat completion': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          ...defaultChatCompletionOptions(createId),
        })
        break
      }
    }
  }

  const updateBaseUrl = (baseUrl: string) => {
    onOptionsChange({
      ...options,
      baseUrl,
    })
  }

  const updateApiVersion = (apiVersion: string) => {
    onOptionsChange({
      ...options,
      apiVersion,
    })
  }

  return (
    <Stack>
      {workspace && (
        <>
          <CredentialsDropdown
            type="openai"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName="OpenAI account"
          />
          <OpenAICredentialsModal
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
        </>
      )}
      {options.credentialsId && (
        <>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Customize provider
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel as={Stack} spacing={4}>
                <TextInput
                  label="Base URL"
                  defaultValue={options.baseUrl}
                  onChange={updateBaseUrl}
                />
                {options.baseUrl !== defaultBaseUrl && (
                  <TextInput
                    label="API version"
                    defaultValue={options.apiVersion}
                    onChange={updateApiVersion}
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <DropdownList
            currentItem={options.task}
            items={openAITasks.slice(0, -1)}
            onItemSelect={updateTask}
            placeholder="Select task"
          />
          {options.task && (
            <OpenAITaskSettings
              options={options}
              onOptionsChange={onOptionsChange}
            />
          )}
        </>
      )}
    </Stack>
  )
}

const OpenAITaskSettings = ({
  options,
  onOptionsChange,
}: {
  options: ChatCompletionOpenAIOptions | CreateImageOpenAIOptions
  onOptionsChange: (options: OpenAIBlock['options']) => void
}) => {
  switch (options.task) {
    case 'Create chat completion': {
      return (
        <OpenAIChatCompletionSettings
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case 'Create image': {
      return null
    }
  }
}
