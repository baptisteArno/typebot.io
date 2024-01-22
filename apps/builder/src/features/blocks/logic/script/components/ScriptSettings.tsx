import { Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { ScriptBlock } from '@typebot.io/schemas'
import { defaultScriptOptions } from '@typebot.io/schemas/features/blocks/logic/script/constants'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

type Props = {
  options: ScriptBlock['options']
  onOptionsChange: (options: ScriptBlock['options']) => void
}

export const ScriptSettings = ({ options, onOptionsChange }: Props) => {
  const handleNameChange = (name: string) =>
    onOptionsChange({ ...options, name })

  const handleCodeChange = (content: string) =>
    onOptionsChange({ ...options, content })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({ ...options, isExecutedOnClient })

  return (
    <Stack spacing={4}>
      <TextInput
        label="Name:"
        defaultValue={options?.name ?? defaultScriptOptions.name}
        onChange={handleNameChange}
        withVariableButton={false}
      />
      <Stack>
        <Text>Code:</Text>
        <CodeEditor
          defaultValue={options?.content}
          lang="javascript"
          onChange={handleCodeChange}
        />
        <SwitchWithLabel
          label="Execute on client?"
          moreInfoContent="Check this if you need access to client variables like `window` or `document`."
          initialValue={
            options?.isExecutedOnClient ??
            defaultScriptOptions.isExecutedOnClient
          }
          onCheckChange={updateClientExecution}
        />
      </Stack>
    </Stack>
  )
}
