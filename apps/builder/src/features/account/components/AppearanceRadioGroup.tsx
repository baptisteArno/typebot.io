import {
  RadioGroup,
  HStack,
  VStack,
  Stack,
  Radio,
  Text,
} from '@chakra-ui/react'
import Image from 'next/image'
import lightModeIllustration from 'public/images/light-mode.png'
import darkModeIllustration from 'public/images/dark-mode.png'
import systemModeIllustration from 'public/images/system-mode.png'
import { useScopedI18n } from '@/locales'

type Props = {
  defaultValue: string
  onChange: (value: string) => void
}

export const AppearanceRadioGroup = ({ defaultValue, onChange }: Props) => {
  const scopedT = useScopedI18n('account.preferences.appearance')

  const appearanceData = [
    {
      value: 'light',
      label: scopedT('lightLabel'),
      image: lightModeIllustration,
    },
    {
      value: 'dark',
      label: scopedT('darkLabel'),
      image: darkModeIllustration,
    },
    {
      value: 'system',
      label: scopedT('systemLabel'),
      image: systemModeIllustration,
    },
  ]
  return (
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
                style={{ borderRadius: '0.250rem' }}
                placeholder="blur"
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
}
