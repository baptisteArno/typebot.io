import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { ChatwootOptions, chatwootTasks } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: ChatwootOptions
  onOptionsChange: (options: ChatwootOptions) => void
}

export const ChatwootSettings = ({ options, onOptionsChange }: Props) => {
  const updateTask = (task: (typeof chatwootTasks)[number]) => {
    onOptionsChange({ ...options, task })
  }

  return (
    <Stack spacing={4}>
      <DropdownList
        currentItem={options.task ?? 'Show widget'}
        onItemSelect={updateTask}
        items={chatwootTasks}
      />
      {!options.task ||
        (options.task === 'Show widget' && (
          <>
            <TextInput
              isRequired
              label="Base URL"
              defaultValue={options.baseUrl}
              onChange={(baseUrl: string) => {
                onOptionsChange({ ...options, baseUrl })
              }}
              withVariableButton={false}
            />
            <TextInput
              isRequired
              label="Website token"
              defaultValue={options.websiteToken}
              onChange={(websiteToken) =>
                onOptionsChange({ ...options, websiteToken })
              }
              moreInfoTooltip="Can be found in Chatwoot under Settings > Inboxes > Settings > Configuration, in the code snippet."
            />
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Set user details
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} as={Stack} spacing="4">
                  <TextInput
                    label="ID"
                    defaultValue={options.user?.id}
                    onChange={(id: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options.user, id },
                      })
                    }}
                  />
                  <TextInput
                    label="Name"
                    defaultValue={options.user?.name}
                    onChange={(name: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options.user, name },
                      })
                    }}
                  />
                  <TextInput
                    label="Email"
                    defaultValue={options.user?.email}
                    onChange={(email: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options.user, email },
                      })
                    }}
                  />
                  <TextInput
                    label="Avatar URL"
                    defaultValue={options.user?.avatarUrl}
                    onChange={(avatarUrl: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options.user, avatarUrl },
                      })
                    }}
                  />
                  <TextInput
                    label="Phone number"
                    defaultValue={options.user?.phoneNumber}
                    onChange={(phoneNumber: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options.user, phoneNumber },
                      })
                    }}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </>
        ))}
    </Stack>
  )
}
