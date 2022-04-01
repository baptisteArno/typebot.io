import {
  Popover,
  Tooltip,
  chakra,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react'
import React from 'react'
import { ImageUploadContent } from '../ImageUploadContent'
import { TypebotIcon } from './TypebotIcon'

type Props = { icon?: string | null; onChangeIcon: (icon: string) => void }

export const EditableTypebotIcon = ({ icon, onChangeIcon }: Props) => {
  return (
    <Popover isLazy>
      {({ onClose }) => (
        <>
          <Tooltip label="Change icon">
            <chakra.span
              cursor="pointer"
              px="2"
              rounded="md"
              _hover={{ bgColor: 'gray.100' }}
              transition="background-color 0.2s"
              data-testid="editable-icon"
            >
              <PopoverTrigger>
                <chakra.span>
                  <TypebotIcon icon={icon} emojiFontSize="2xl" />
                </chakra.span>
              </PopoverTrigger>
            </chakra.span>
          </Tooltip>
          <PopoverContent p="2">
            <ImageUploadContent
              url={icon ?? ''}
              onSubmit={onChangeIcon}
              isGiphyEnabled={false}
              isEmojiEnabled={true}
              onClose={onClose}
            />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
