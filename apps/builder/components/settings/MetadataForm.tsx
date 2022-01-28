import React from 'react'
import { Metadata } from 'models'
import {
  FormLabel,
  Popover,
  PopoverTrigger,
  Stack,
  Image,
  PopoverContent,
} from '@chakra-ui/react'
import { ImageUploadContent } from 'components/shared/ImageUploadContent'
import {
  InputWithVariableButton,
  TextareaWithVariableButton,
} from 'components/shared/TextboxWithVariableButton'

type Props = {
  typebotName: string
  metadata: Metadata
  onMetadataChange: (metadata: Metadata) => void
}

export const MetadataForm = ({
  typebotName,
  metadata,
  onMetadataChange,
}: Props) => {
  const handleTitleChange = (title: string) =>
    onMetadataChange({ ...metadata, title })
  const handleDescriptionChange = (description: string) =>
    onMetadataChange({ ...metadata, description })
  const handleFavIconSubmit = (favIconUrl: string) =>
    onMetadataChange({ ...metadata, favIconUrl })
  const handleImageSubmit = (imageUrl: string) =>
    onMetadataChange({ ...metadata, imageUrl })

  return (
    <Stack spacing="6">
      <Stack>
        <FormLabel mb="0" htmlFor="icon">
          Icon:
        </FormLabel>
        <Popover isLazy>
          <PopoverTrigger>
            <Image
              src={metadata.favIconUrl ?? '/favicon.png'}
              w="20px"
              alt="Fav icon"
              cursor="pointer"
              _hover={{ filter: 'brightness(.9)' }}
              transition="filter 200ms"
              rounded="md"
            />
          </PopoverTrigger>
          <PopoverContent p="4">
            <ImageUploadContent
              url={metadata.favIconUrl ?? ''}
              onSubmit={handleFavIconSubmit}
              isGiphyEnabled={false}
            />
          </PopoverContent>
        </Popover>
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="image">
          Image:
        </FormLabel>
        <Popover isLazy>
          <PopoverTrigger>
            <Image
              src={metadata.imageUrl ?? '/viewer-preview.png'}
              alt="Website image"
              cursor="pointer"
              _hover={{ filter: 'brightness(.9)' }}
              transition="filter 200ms"
              rounded="md"
            />
          </PopoverTrigger>
          <PopoverContent p="4">
            <ImageUploadContent
              url={metadata.imageUrl}
              onSubmit={handleImageSubmit}
              isGiphyEnabled={false}
            />
          </PopoverContent>
        </Popover>
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="title">
          Title:
        </FormLabel>
        <InputWithVariableButton
          id="title"
          initialValue={metadata.title ?? typebotName}
          onChange={handleTitleChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="description">
          Description:
        </FormLabel>
        <TextareaWithVariableButton
          id="description"
          initialValue={metadata.description}
          onChange={handleDescriptionChange}
        />
      </Stack>
    </Stack>
  )
}
