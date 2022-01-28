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
} from '@chakra-ui/react'
import React, { ChangeEvent, useEffect, useState } from 'react'

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

  return (
    <Popover variant="picker" placement="right" isLazy>
      <PopoverTrigger>
        <Button
          aria-label={'Pick a color'}
          background={color}
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
          color={color === '#ffffff' ? 'gray.800' : 'white'}
        >
          <Center height="100%">{color}</Center>
        </PopoverHeader>
        <PopoverBody height="120px">
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
                onClick={() => {
                  setColor(c)
                }}
              ></Button>
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
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
