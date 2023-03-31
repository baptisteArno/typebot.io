import { MouseIcon, LaptopIcon } from '@/components/icons'
import { useScopedI18n } from '@/locales'
import {
  HStack,
  Radio,
  RadioGroup,
  Stack,
  VStack,
  Text,
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
  const scopedT = useScopedI18n('account.preferences.graphNavigation')
  const graphNavigationData = [
    {
      value: GraphNavigation.MOUSE,
      label: scopedT('mouse.label'),
      description: scopedT('mouse.description'),
      icon: <MouseIcon boxSize="35px" />,
    },
    {
      value: GraphNavigation.TRACKPAD,
      label: scopedT('trackpad.label'),
      description: scopedT('trackpad.description'),
      icon: <LaptopIcon boxSize="35px" />,
    },
  ]
  return (
    <RadioGroup onChange={onChange} defaultValue={defaultValue}>
      <HStack spacing={4} w="full" align="stretch">
        {graphNavigationData.map((option) => (
          <VStack
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
            <VStack spacing={6}>
              {option.icon}
              <Stack>
                <Text fontWeight="bold">{option.label}</Text>
                <Text>{option.description}</Text>
              </Stack>
            </VStack>

            <Radio value={option.value} id={option.label} />
          </VStack>
        ))}
      </HStack>
    </RadioGroup>
  )
}
