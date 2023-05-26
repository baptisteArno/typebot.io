import React from 'react'
import { TextInput, Textarea } from '@/components/inputs'
import { PictureChoiceItem } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import {
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
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
  const updateTitle = (title: string) => onItemChange({ ...item, title })

  const updateImage = (pictureSrc: string) => {
    onItemChange({ ...item, pictureSrc })
  }

  const updateDescription = (description: string) =>
    onItemChange({ ...item, description })

  return (
    <Stack>
      <HStack>
        <Text fontWeight="medium">Image:</Text>
        <Popover isLazy>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button size="sm">Pick an image</Button>
              </PopoverTrigger>
              <PopoverContent p="4" w="500px">
                <ImageUploadContent
                  filePath={`typebots/${typebotId}/blocks/${item.blockId}/items/${item.id}`}
                  defaultUrl={item.pictureSrc}
                  onSubmit={(url) => {
                    updateImage(url)
                    onClose()
                  }}
                  excludedTabs={['emoji']}
                />
              </PopoverContent>
            </>
          )}
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
