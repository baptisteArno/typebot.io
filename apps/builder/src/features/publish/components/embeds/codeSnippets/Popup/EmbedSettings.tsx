import {
  StackProps,
  Stack,
  Flex,
  Heading,
  NumberInput,
  NumberInputField,
  Switch,
  HStack,
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
  const [isEnabled, setIsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    onUpdateSettings({
      delay: isEnabled ? inputValue * 1000 : undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, isEnabled])

  return (
    <Stack {...props}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading fontSize="md" fontWeight="semibold">
          Popup settings
        </Heading>
      </Flex>

      <Flex justify="space-between" align="center" mb="2">
        <HStack>
          <p>Appearance delay</p>
          <Switch
            isChecked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
        </HStack>

        {isEnabled && (
          <NumberInput
            onChange={(_, val) => setInputValue(val)}
            value={inputValue}
            min={0}
          >
            <NumberInputField />
            <NumberIncrementStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberIncrementStepper>
          </NumberInput>
        )}
      </Flex>
    </Stack>
  )
}
