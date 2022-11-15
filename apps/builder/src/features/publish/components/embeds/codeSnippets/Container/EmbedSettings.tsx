import {
  StackProps,
  Stack,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Switch,
  Input,
  HStack,
  Text,
} from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { useState, useEffect } from 'react'

type StandardEmbedWindowSettingsProps = {
  onUpdateWindowSettings: (windowSettings: {
    heightLabel: string
    widthLabel: string
  }) => void
}
export const StandardEmbedWindowSettings = ({
  onUpdateWindowSettings,
  ...props
}: StandardEmbedWindowSettingsProps & StackProps) => {
  const [fullscreen, setFullscreen] = useState(false)
  const [inputValues, setInputValues] = useState({
    widthValue: '100',
    widthType: '%',
    heightValue: '600',
    heightType: 'px',
  })

  useEffect(() => {
    onUpdateWindowSettings({
      widthLabel: fullscreen
        ? '100%'
        : inputValues.widthValue + inputValues.widthType,
      heightLabel: fullscreen
        ? '100vh'
        : inputValues.heightValue + inputValues.heightType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValues, fullscreen])

  const handleWidthTypeSelect = (widthType: string) =>
    setInputValues({ ...inputValues, widthType })
  const handleHeightTypeSelect = (heightType: string) =>
    setInputValues({ ...inputValues, heightType })

  return (
    <Stack {...props}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading fontSize="md" fontWeight="semibold" style={{ flexShrink: 0 }}>
          Window settings
        </Heading>
        <FormControl
          display="flex"
          alignItems="center"
          w="full"
          justifyContent="flex-end"
        >
          <FormLabel htmlFor="fullscreen-option" mb="1">
            Set to fullscreen?
          </FormLabel>
          <Switch
            id="fullscreen-option"
            onChange={() => setFullscreen(!fullscreen)}
            isChecked={fullscreen}
          />
        </FormControl>
      </Flex>

      {!fullscreen && (
        <>
          <Flex justify="space-between" align="center" mb="2">
            <Text>Width</Text>
            <HStack>
              <Input
                onChange={(e) =>
                  setInputValues({
                    ...inputValues,
                    widthValue: e.target.value,
                  })
                }
                w="70px"
                value={inputValues.widthValue}
              />
              <DropdownList<string>
                items={['px', '%']}
                onItemSelect={handleWidthTypeSelect}
                currentItem={inputValues.widthType}
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center" mb="2">
            <Text>Height</Text>
            <HStack>
              <Input
                onChange={(e) =>
                  setInputValues({
                    ...inputValues,
                    heightValue: e.target.value,
                  })
                }
                w="70px"
                value={inputValues.heightValue}
              />
              <DropdownList<string>
                items={['px', '%']}
                onItemSelect={handleHeightTypeSelect}
                currentItem={inputValues.heightType}
              />
            </HStack>
          </Flex>
        </>
      )}
    </Stack>
  )
}
