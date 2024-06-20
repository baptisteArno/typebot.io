import { NumberInput } from '@/components/inputs'
import {
  StackProps,
  Stack,
  Heading,
  Switch,
  HStack,
  Text,
} from '@chakra-ui/react'
import { PopupProps } from '@sniper.io/nextjs'
import { useState, useEffect } from 'react'
import { isDefined } from '@sniper.io/lib'

type Props = {
  onUpdateSettings: (windowSettings: Pick<PopupProps, 'autoShowDelay'>) => void
} & StackProps

export const PopupSettings = ({ onUpdateSettings, ...props }: Props) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState(5)

  useEffect(() => {
    onUpdateSettings({
      autoShowDelay: isEnabled ? inputValue * 1000 : undefined,
    })
  }, [inputValue, isEnabled, onUpdateSettings])

  return (
    <Stack {...props} spacing={4}>
      <Heading size="sm">Popup settings</Heading>

      <HStack pl={4}>
        <Text flexShrink={0}>Auto show</Text>
        <Switch
          isChecked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
        />
        {isEnabled && (
          <>
            <Text>after</Text>
            <NumberInput
              size="sm"
              w="70px"
              defaultValue={inputValue}
              onValueChange={(val) => isDefined(val) && setInputValue(val)}
              withVariableButton={false}
            />
            <Text>seconds</Text>
          </>
        )}
      </HStack>
    </Stack>
  )
}
