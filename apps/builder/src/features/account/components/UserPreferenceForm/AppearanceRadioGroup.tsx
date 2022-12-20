import {
  RadioGroup,
  HStack,
  VStack,
  Stack,
  Radio,
  Image,
  Text,
} from '@chakra-ui/react'

const appearanceData = [
  {
    value: 'light',
    label: 'Light',
    image: '/images/light-mode.png',
  },
  {
    value: 'dark',
    label: 'Dark',
    image: '/images/dark-mode.png',
  },
  {
    value: 'system',
    label: 'System',
    image: '/images/system-mode.png',
  },
]

type Props = {
  defaultValue: string
  onChange: (value: string) => void
}

export const AppearanceRadioGroup = ({ defaultValue, onChange }: Props) => (
  <RadioGroup onChange={onChange} defaultValue={defaultValue}>
    <HStack spacing={4} w="full" align="stretch">
      {appearanceData.map((option) => (
        <VStack
          key={option.value}
          as="label"
          htmlFor={option.label}
          cursor="pointer"
          borderWidth="1px"
          borderRadius="md"
          w="full"
          spacing={2}
          justifyContent="space-between"
          pb={6}
        >
          <VStack spacing={4}>
            <Image
              src={option.image}
              alt="Theme preview"
              borderTopRadius="md"
            />
            <Stack>
              <Text fontWeight="bold">{option.label}</Text>
            </Stack>
          </VStack>

          <Radio value={option.value} id={option.label} />
        </VStack>
      ))}
    </HStack>
  </RadioGroup>
)
