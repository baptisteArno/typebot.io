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
import React, { ChangeEvent, useState } from 'react'
import tinyColor from 'tinycolor2'

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
  onColorChange: (color: string) => void
}

export const ColorPicker = ({ value, defaultValue, onColorChange }: Props) => {
  const [color, setColor] = useState(defaultValue ?? '')
  const displayedValue = value ?? color

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
    onColorChange(e.target.value)
  }

  const handleClick = (color: string) => () => {
    setColor(color)
    onColorChange(color)
  }

  return (
    <Popover variant="picker" placement="right" isLazy>
      <PopoverTrigger>
        <Button
          aria-label={'Pick a color'}
          height="22px"
          width="22px"
          padding={0}
          borderRadius={3}
          borderWidth={1}
        >
          <Box rounded="full" boxSize="14px" bgColor={displayedValue} />
        </Button>
      </PopoverTrigger>
      <PopoverContent width="170px">
        <PopoverArrow bg={displayedValue} />
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
            aria-label="Color value"
            size="sm"
            value={displayedValue}
            onChange={handleColorChange}
          />
          <NativeColorPicker
            size="sm"
            color={displayedValue}
            onColorChange={handleColorChange}
          >
            Advanced picker
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
  onColorChange: (e: ChangeEvent<HTMLInputElement>) => void
} & ButtonProps) => {
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
        onChange={onColorChange}
      />
    </>
  )
}
