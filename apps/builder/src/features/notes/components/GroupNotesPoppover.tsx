import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react'

import { GroupCommentsNote } from './GroupCommentsNote'
import { GroupNotesPoppoverProps } from './types'

export const GroupNotesPoppover = ({
  children,
  groupId,
}: GroupNotesPoppoverProps) => {
  return (
    <Popover placement="top-start">
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Notes</PopoverHeader>
        <PopoverBody>
          <GroupCommentsNote groupId={groupId} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
