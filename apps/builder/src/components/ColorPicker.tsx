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
import React, { ChangeEvent, useEffect, useState } from 'react'
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
  initialColor: string
  onColorChange: (color: string) => void
}

export const ColorPicker = ({ initialColor, onColorChange }: Props) => {
  const [color, setColor] = useState(initialColor)

  useEffect(() => {
    onColorChange(color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) =>
    setColor(e.target.value)

  const handleClick = (color: string) => () => setColor(color)

  return (
    <Popover variant="picker" placement="right" isLazy>
      <PopoverTrigger>
        <Button
          aria-label={'Pick a color'}
          bgColor={color}
          _hover={{ bgColor: `#${tinyColor(color).darken(10).toHex()}` }}
          _active={{ bgColor: `#${tinyColor(color).darken(30).toHex()}` }}
          height="22px"
          width="22px"
          padding={0}
          borderRadius={3}
          borderWidth={1}
        />
      </PopoverTrigger>
      <PopoverContent width="170px">
        <PopoverArrow bg={color} />
        <PopoverCloseButton color="white" />
        <PopoverHeader
          height="100px"
          backgroundColor={color}
          borderTopLeftRadius={5}
          borderTopRightRadius={5}
          color={tinyColor(color).isLight() ? 'gray.800' : 'white'}
        >
          <Center height="100%">{color}</Center>
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
            value={color}
            onChange={handleColorChange}
          />
          <NativeColorPicker
            size="sm"
            color={color}
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
