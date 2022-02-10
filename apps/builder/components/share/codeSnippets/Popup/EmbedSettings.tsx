import {
  StackProps,
  Stack,
  Flex,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { PopupParams } from 'typebot-js'

type PopupEmbedSettingsProps = {
  onUpdateSettings: (windowSettings: Pick<PopupParams, 'delay'>) => void
}
export const PopupEmbedSettings = ({
  onUpdateSettings,
  ...props
}: PopupEmbedSettingsProps & StackProps) => {
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    onUpdateSettings({
      delay: inputValue * 1000,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  return (
    <Stack {...props}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading fontSize="md" fontWeight="semibold">
          Popup settings
        </Heading>
      </Flex>

      <Flex justify="space-between" align="center" mb="2">
        <p>Appearance delay</p>
        <NumberInput
          onChange={(_, val) => setInputValue(val)}
          value={inputValue}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Flex>
    </Stack>
  )
}
