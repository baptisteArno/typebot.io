import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { Input } from 'components/shared/Textbox'
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
        <Input
          id="name"
          value={options.name}
          defaultValue={options.name}
          onChange={handleNameChange}
          withVariableButton={false}
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
