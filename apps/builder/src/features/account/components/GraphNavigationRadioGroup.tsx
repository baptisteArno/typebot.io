import { MouseIcon, LaptopIcon } from '@/components/icons'
import { useTranslate } from '@tolgee/react'
import {
  HStack,
  Radio,
  RadioGroup,
  Stack,
  VStack,
  Text,
  Image,
} from '@chakra-ui/react'
import { GraphNavigation } from '@typebot.io/prisma'

type Props = {
  defaultValue: string
  onChange: (value: string) => void
}
export const GraphNavigationRadioGroup = ({
  defaultValue,
  onChange,
}: Props) => {
  const { t } = useTranslate()
  const graphNavigationData = [
    {
      value: GraphNavigation.MOUSE,
      label: t('account.preferences.graphNavigation.mouse.label'),
      description: t('account.preferences.graphNavigation.mouse.description'),
      icon: <MouseIcon boxSize="35px" />,
      image: '/images/mouse-interaction-gesture.png',
    },
    {
      value: GraphNavigation.TRACKPAD,
      label: t('account.preferences.graphNavigation.trackpad.label'),
      description: t(
        'account.preferences.graphNavigation.trackpad.description'
      ),
      icon: <LaptopIcon boxSize="35px" />,
      image: '/images/trackpad-interaction-gesture.png',
    },
  ]
  return (
    <RadioGroup onChange={onChange} defaultValue={defaultValue}>
      <VStack spacing={4} w="full" align="stretch">
        {graphNavigationData.map((option) => (
          <HStack
            key={option.value}
            as="label"
            htmlFor={option.label}
            cursor="pointer"
            borderWidth="1px"
            borderRadius="md"
            w="full"
            p="6"
            spacing={6}
            justifyContent="space-between"
          >
            <HStack spacing={6}>
              {/* {option.icon} */}
              <Image
                src={option.image}
                alt={option.description}
                rounded="md"
                w="80px"
              />
              <Stack>
                <Text fontWeight="bold">{option.label}</Text>
                <Text fontSize="xs">{option.description}</Text>
              </Stack>
            </HStack>

            <Radio value={option.value} id={option.label} />
          </HStack>
        ))}
      </VStack>
    </RadioGroup>
  )
}
