import React from 'react'
import { TextInput, Textarea } from '@/components/inputs'
import { PictureChoiceItem } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import {
  Button,
  HStack,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'

type Props = {
  typebotId: string
  item: PictureChoiceItem
  onItemChange: (updates: Partial<PictureChoiceItem>) => void
}

export const PictureChoiceItemSettings = ({
  typebotId,
  item,
  onItemChange,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const updateTitle = (title: string) => onItemChange({ ...item, title })

  const updateImage = (pictureSrc: string) => {
    onItemChange({ ...item, pictureSrc })
    onClose()
  }

  const updateDescription = (description: string) =>
    onItemChange({ ...item, description })

  return (
    <Stack>
      <HStack>
        <Text fontWeight="medium">Image:</Text>
        <Popover isLazy isOpen={isOpen}>
          <PopoverAnchor>
            <Button size="sm" onClick={onOpen}>
              Pick an image
            </Button>
          </PopoverAnchor>
          <PopoverContent p="4" w="500px">
            <ImageUploadContent
              filePath={`typebots/${typebotId}/blocks/${item.blockId}/items/${item.id}`}
              defaultUrl={item.pictureSrc}
              onSubmit={updateImage}
            />
          </PopoverContent>
        </Popover>
      </HStack>
      <TextInput
        label="Title:"
        defaultValue={item.title}
        onChange={updateTitle}
      />
      <Textarea
        label="Description:"
        defaultValue={item.description}
        onChange={updateDescription}
      />
    </Stack>
  )
}
