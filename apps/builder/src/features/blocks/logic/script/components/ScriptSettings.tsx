import { Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { ScriptBlock } from '@typebot.io/schemas'
import { defaultScriptOptions } from '@typebot.io/schemas/features/blocks/logic/script/constants'

type Props = {
  options: ScriptBlock['options']
  onOptionsChange: (options: ScriptBlock['options']) => void
}

export const ScriptSettings = ({ options, onOptionsChange }: Props) => {
  const handleNameChange = (name: string) =>
    onOptionsChange({ ...options, name })
  const handleCodeChange = (content: string) =>
    onOptionsChange({ ...options, content })

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
      </Stack>
    </Stack>
  )
}
