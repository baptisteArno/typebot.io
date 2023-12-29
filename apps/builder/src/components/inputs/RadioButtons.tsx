import {
  Box,
  Flex,
  Stack,
  useColorModeValue,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ReactNode } from 'react'

type Props<T extends string> = {
  options: (T | { value: T; label: ReactNode })[]
  value?: T
  defaultValue?: T
  direction?: 'row' | 'column'
  onSelect: (newValue: T) => void
}
export const RadioButtons = <T extends string>({
  options,
  value,
  defaultValue,
  direction = 'row',
  onSelect,
}: Props<T>) => {
  const { t } = useTranslate()

  const { getRootProps, getRadioProps } = useRadioGroup({
    value,
    defaultValue,
    onChange: onSelect,
  })

  const group = getRootProps()

  return (
    <Stack {...group} direction={direction}>
      {options.map((item) => {
        const radio = getRadioProps({ value: parseValue(item) })
        const parsedLabel = parseLabel(item)
        return (
          <RadioCard key={parseValue(item)} {...radio}>
            {isString(parsedLabel)
              ? t(
                  `components.radioButtons.item.${parsedLabel.replace(
                    /\s/g,
                    ''
                  )}`,
                  parsedLabel
                )
              : parsedLabel}
          </RadioCard>
        )
      })}
    </Stack>
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
        borderWidth="2px"
        borderRadius="md"
        _checked={{
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

const parseValue = (item: string | { value: string; label: ReactNode }) =>
  typeof item === 'string' ? item : item.value

const parseLabel = (item: string | { value: string; label: ReactNode }) =>
  typeof item === 'string' ? item : item.label

const isString = (value: string | ReactNode): value is string =>
  typeof value === 'string'
