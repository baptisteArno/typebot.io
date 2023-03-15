import { Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { ScriptOptions } from '@typebot.io/schemas'

type Props = {
  options: ScriptOptions
  onOptionsChange: (options: ScriptOptions) => void
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
        defaultValue={options.name}
        onChange={handleNameChange}
        withVariableButton={false}
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
