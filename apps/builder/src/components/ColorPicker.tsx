import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  Center,
  PopoverBody,
  SimpleGrid,
  Input,
  Button,
  Stack,
  ButtonProps,
  Box,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import React, { useState } from 'react'
import tinyColor from 'tinycolor2'
import { useDebouncedCallback } from 'use-debounce'

const colorsSelection: `#${string}`[] = [
  '#666460',
  '#FFFFFF',
  '#A87964',
  '#D09C46',
  '#DE8031',
  '#598E71',
  '#4A8BB2',
  '#9B74B7',
  '#C75F96',
  '#0042DA',
]

type Props = {
  value?: string
  defaultValue?: string
  isDisabled?: boolean
  onColorChange: (color: string) => void
}

export const ColorPicker = ({
  value,
  defaultValue,
  isDisabled,
  onColorChange,
}: Props) => {
  const { t } = useTranslate()
  const [color, setColor] = useState(defaultValue ?? '')
  const displayedValue = value ?? color

  const handleColorChange = (color: string) => {
    setColor(color)
    onColorChange(color)
  }

  const handleClick = (color: string) => () => {
    setColor(color)
    onColorChange(color)
  }

  return (
    <Popover variant="picker" placement="right" isLazy>
      <PopoverTrigger>
        <Button
          aria-label={t('colorPicker.pickColor.ariaLabel')}
          height="22px"
          width="22px"
          padding={0}
          borderRadius={3}
          borderWidth={1}
          isDisabled={isDisabled}
        >
          <Box rounded="full" boxSize="14px" bgColor={displayedValue} />
        </Button>
      </PopoverTrigger>
      <PopoverContent width="170px">
        <PopoverArrow />
        <PopoverCloseButton color="white" />
        <PopoverHeader
          height="100px"
          backgroundColor={displayedValue}
          borderTopLeftRadius={5}
          borderTopRightRadius={5}
          color={tinyColor(displayedValue).isLight() ? 'gray.800' : 'white'}
        >
          <Center height="100%">{displayedValue}</Center>
        </PopoverHeader>
        <PopoverBody as={Stack}>
          <SimpleGrid columns={5} spacing={2}>
            {colorsSelection.map((color) => (
              <Button
                key={color}
                aria-label={color}
                background={color}
                height="22px"
                width="22px"
                padding={0}
                minWidth="unset"
                borderRadius={3}
                borderWidth={color === '#FFFFFF' ? 1 : undefined}
                _hover={{ background: color }}
                onClick={handleClick(color)}
              />
            ))}
          </SimpleGrid>
          <Input
            borderRadius={3}
            marginTop={3}
            placeholder="#2a9d8f"
            aria-label={t('colorPicker.colorValue.ariaLabel')}
            size="sm"
            value={displayedValue}
            onChange={(e) => handleColorChange(e.target.value)}
          />
          <NativeColorPicker
            size="sm"
            color={displayedValue}
            onColorChange={handleColorChange}
          >
            {t('colorPicker.advancedColors')}
          </NativeColorPicker>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const NativeColorPicker = ({
  color,
  onColorChange,
  ...props
}: {
  color: string
  onColorChange: (color: string) => void
} & ButtonProps) => {
  const debouncedOnColorChange = useDebouncedCallback((color: string) => {
    onColorChange(color)
  }, 200)

  return (
    <>
      <Button as="label" htmlFor="native-picker" {...props}>
        {props.children}
      </Button>
      <Input
        type="color"
        display="none"
        id="native-picker"
        value={color}
        onChange={(e) => debouncedOnColorChange(e.target.value)}
      />
    </>
  )
}
