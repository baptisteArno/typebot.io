import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { AssignToTeamOptions, Variable } from 'models'
import React, { useEffect} from 'react'

type AssignToTeamSettingsBodyProps = {
  options: AssignToTeamOptions
  onOptionsChange: (options: AssignToTeamOptions) => void
}

export const AssignToTeamSettingsBody = ({
  options,
  onOptionsChange,
}: AssignToTeamSettingsBodyProps) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, placeholder } })
  // const handleButtonLabelChange = (button: string) =>
  //   onOptionsChange({ ...options, labels: { ...options.labels, button } })
  // const handleLongChange = (isLong: boolean) =>
  //   onOptionsChange({ ...options, isLong })
  // const handleVariableChange = (variable?: Variable) =>
  //   onOptionsChange({ ...options, variableId: variable?.id })

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked times`;
  });

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Placeholder:
        </FormLabel>
        <Input
          id="placeholder"
          defaultValue={options.labels.placeholder}
          onChange={handlePlaceholderChange}
        />
      </Stack>
    </Stack>
  )
}
