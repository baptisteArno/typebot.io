import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/CodeEditor'
import React from 'react'
import { SwitchWithLabel } from '@/components/SwitchWithLabel'
import { Input } from '@/components/inputs'
import { ScriptOptions } from 'models'

type Props = {
  options: ScriptOptions
  onOptionsChange: (options: ScriptOptions) => void
}

export const ScriptSettings = ({ options, onOptionsChange }: Props) => {
  const handleNameChange = (name: string) =>
    onOptionsChange({ ...options, name })
  const handleCodeChange = (content: string) =>
    onOptionsChange({ ...options, content })
  const handleShouldExecuteInParentContextChange = (
    shouldExecuteInParentContext: boolean
  ) => onOptionsChange({ ...options, shouldExecuteInParentContext })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="name">
          Name:
        </FormLabel>
        <Input
          id="name"
          defaultValue={options.name}
          onChange={handleNameChange}
          withVariableButton={false}
        />
      </Stack>
      <SwitchWithLabel
        label="Execute in parent window"
        moreInfoContent="Execute the code in the parent window context (when the bot is embedded). If it isn't detected, the code will be executed in the current window context."
        initialValue={options.shouldExecuteInParentContext ?? false}
        onCheckChange={handleShouldExecuteInParentContextChange}
      />
      <Stack>
        <Text>Code:</Text>
        <CodeEditor
          defaultValue={options.content ?? ''}
          lang="javascript"
          onChange={handleCodeChange}
        />
      </Stack>
    </Stack>
  )
}
