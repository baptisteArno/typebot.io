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
} from '@chakra-ui/react'
import React, { ChangeEvent, useState } from 'react'
import tinyColor from 'tinycolor2'

const colorsSelection: `#${string}`[] = [
  '#264653',
  '#e9c46a',
  '#2a9d8f',
  '#7209b7',
  '#023e8a',
  '#ffe8d6',
  '#d8f3dc',
  '#4ea8de',
  '#ffb4a2',
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
          bgColor={displayedValue}
          _hover={{
            bgColor: `#${tinyColor(displayedValue).darken(10).toHex()}`,
          }}
          _active={{
            bgColor: `#${tinyColor(displayedValue).darken(30).toHex()}`,
          }}
          height="22px"
          width="22px"
          padding={0}
          borderRadius={3}
          borderWidth={1}
        />
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
            {colorsSelection.map((c) => (
              <Button
                key={c}
                aria-label={c}
                background={c}
                height="22px"
                width="22px"
                padding={0}
                minWidth="unset"
                borderRadius={3}
                _hover={{ background: c }}
                onClick={handleClick(c)}
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
