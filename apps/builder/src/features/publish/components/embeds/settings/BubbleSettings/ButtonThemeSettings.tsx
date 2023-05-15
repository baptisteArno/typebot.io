import { ColorPicker } from '@/components/ColorPicker'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { ChevronDownIcon } from '@/components/icons'
import {
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { ButtonTheme } from '@typebot.io/js/dist/features/bubble/types'
import React from 'react'

type Props = {
  buttonTheme: ButtonTheme | undefined
  onChange: (newButtonTheme?: ButtonTheme) => void
}

export const ButtonThemeSettings = ({ buttonTheme, onChange }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...buttonTheme,
      backgroundColor,
    })
  }

  const updateCustomIconSrc = (customIconSrc: string) => {
    onChange({
      ...buttonTheme,
      customIconSrc,
    })
    onClose()
  }

  const updateSize = (size: ButtonTheme['size']) =>
    onChange({
      ...buttonTheme,
      size,
    })

  return (
    <Stack spacing={4} borderWidth="1px" rounded="md" p="4">
      <Heading size="sm">Button</Heading>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Text>Size</Text>
          <Menu>
            <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
              {buttonTheme?.size ?? 'medium'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => updateSize('medium')}>medium</MenuItem>
              <MenuItem onClick={() => updateSize('large')}>large</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <HStack justify="space-between">
          <Text>Color</Text>
          <ColorPicker
            defaultValue={buttonTheme?.backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Custom icon</Text>
          <Popover isLazy isOpen={isOpen}>
            <PopoverAnchor>
              <Button size="sm" onClick={onOpen}>
                Pick an image
              </Button>
            </PopoverAnchor>
            <PopoverContent p="4" w="500px">
              <ImageUploadContent
                onSubmit={updateCustomIconSrc}
                filePath={undefined}
              />
            </PopoverContent>
          </Popover>
        </HStack>
      </Stack>
    </Stack>
  )
}
