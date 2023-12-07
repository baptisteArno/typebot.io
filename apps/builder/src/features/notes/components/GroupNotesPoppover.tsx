import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'

import { GroupNoteComments } from './GroupNoteComments'
import { GroupNotesPoppoverProps } from './types'

export const GroupNotesPoppover = ({
  children,
  groupId,
}: GroupNotesPoppoverProps) => {
  return (
    <Popover placement="top-start">
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent borderRadius="2xl">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Text fontSize="2xl" textAlign="center">
            Notes
          </Text>
        </PopoverHeader>
        <PopoverBody>
          <GroupNoteComments groupId={groupId} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
