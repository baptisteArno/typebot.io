import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { CodeOptions } from 'models'
import React from 'react'

type Props = {
  options: CodeOptions
  onOptionsChange: (options: CodeOptions) => void
}

export const CodeSettings = ({ options, onOptionsChange }: Props) => {
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
        <DebouncedInput
          id="name"
          initialValue={options.name}
          onChange={handleNameChange}
        />
      </Stack>
      <Stack>
        <Text>Code:</Text>
        <CodeEditor
          value={options.content ?? ''}
          lang="js"
          onChange={handleCodeChange}
        />
      </Stack>
    </Stack>
  )
}
