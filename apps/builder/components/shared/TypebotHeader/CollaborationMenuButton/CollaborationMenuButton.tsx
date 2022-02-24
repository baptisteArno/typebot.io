import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { UsersIcon } from 'assets/icons'
import React from 'react'
import { CollaborationList } from './CollaborationList'

export const CollaborationMenuButton = () => {
  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <span>
          <Tooltip label="Invite users to collaborate">
            <IconButton
              icon={<UsersIcon />}
              aria-label="Show collaboration menu"
            />
          </Tooltip>
        </span>
      </PopoverTrigger>
      <PopoverContent shadow="lg" width="430px">
        <CollaborationList />
      </PopoverContent>
    </Popover>
  )
}
