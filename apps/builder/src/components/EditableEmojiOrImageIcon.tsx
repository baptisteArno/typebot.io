import {
  Popover,
  Tooltip,
  chakra,
  PopoverTrigger,
  PopoverContent,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'
import { EmojiOrImageIcon } from './EmojiOrImageIcon'
import { ImageUploadContent } from './ImageUploadContent'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'

type Props = {
  uploadFileProps: FilePathUploadProps
  icon?: string | null
  onChangeIcon: (icon: string) => void
  boxSize?: string
}

export const EditableEmojiOrImageIcon = ({
  uploadFileProps,
  icon,
  onChangeIcon,
  boxSize,
}: Props) => {
  const bg = useColorModeValue('gray.100', 'gray.700')

  return (
    <Popover isLazy>
      {({ onClose }: { onClose: () => void }) => (
        <>
          <Tooltip label="Change icon">
            <Flex
              cursor="pointer"
              p="2"
              rounded="md"
              _hover={{
                bg,
              }}
              transition="background-color 0.2s"
              data-testid="editable-icon"
            >
              <PopoverTrigger>
                <chakra.span>
                  <EmojiOrImageIcon
                    icon={icon}
                    emojiFontSize="2xl"
                    boxSize={boxSize}
                  />
                </chakra.span>
              </PopoverTrigger>
            </Flex>
          </Tooltip>
          <PopoverContent p="2">
            <ImageUploadContent
              uploadFileProps={uploadFileProps}
              defaultUrl={icon ?? ''}
              onSubmit={onChangeIcon}
              excludedTabs={['giphy', 'unsplash']}
              onClose={onClose}
              initialTab="icon"
            />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
