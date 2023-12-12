import {
  RadioGroup,
  HStack,
  VStack,
  Stack,
  Radio,
  Text,
  Image,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

type Props = {
  defaultValue: string
  onChange: (value: string) => void
}

export const AppearanceRadioGroup = ({ defaultValue, onChange }: Props) => {
  const { t } = useTranslate()

  const appearanceData = [
    {
      value: 'light',
      label: t('account.preferences.appearance.lightLabel'),
      image: '/images/light-mode.png',
    },
    {
      value: 'dark',
      label: t('account.preferences.appearance.darkLabel'),
      image: '/images/dark-mode.png',
    },
    {
      value: 'system',
      label: t('account.preferences.appearance.systemLabel'),
      image: '/images/system-mode.png',
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
