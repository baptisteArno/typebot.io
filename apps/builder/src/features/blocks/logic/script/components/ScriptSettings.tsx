import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/CodeEditor'
import React from 'react'
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
