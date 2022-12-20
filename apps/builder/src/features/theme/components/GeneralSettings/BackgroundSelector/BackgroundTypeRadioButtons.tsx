import {
  Box,
  Flex,
  HStack,
  useColorModeValue,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from '@chakra-ui/react'
import { BackgroundType } from 'models'
import { ReactNode } from 'react'

type Props = {
  backgroundType: BackgroundType
  onBackgroundTypeChange: (type: BackgroundType) => void
}
export const BackgroundTypeRadioButtons = ({
  backgroundType,
  onBackgroundTypeChange,
}: Props) => {
  const options = ['Color', 'None']

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'background-type',
    defaultValue: backgroundType,
    onChange: (nextVal: string) =>
      onBackgroundTypeChange(nextVal as BackgroundType),
  })

  const group = getRootProps()

  return (
    <HStack {...group}>
      {options.map((value) => {
        const radio = getRadioProps({ value })
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        )
      })}
    </HStack>
  )
}

export const RadioCard = (props: UseRadioProps & { children: ReactNode }) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label" flex="1">
      <input {...input} />
      <Flex
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        _checked={{
          borderWidth: '2px',
          borderColor: 'blue.400',
        }}
        _hover={{
          bgColor: useColorModeValue('gray.100', 'gray.700'),
        }}
        _active={{
          bgColor: useColorModeValue('gray.200', 'gray.600'),
        }}
        px={5}
        py={2}
        transition="background-color 150ms, color 150ms, border 150ms"
        justifyContent="center"
      >
        {props.children}
      </Flex>
    </Box>
  )
}
