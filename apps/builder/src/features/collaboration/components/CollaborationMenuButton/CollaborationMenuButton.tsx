import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { UsersIcon } from '@/components/icons'
import React from 'react'
import { CollaborationList } from './CollaborationList'

export const CollaborationMenuButton = ({
  isLoading,
}: {
  isLoading: boolean
}) => {
  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <span>
          <Tooltip label="Invite users to collaborate">
            <IconButton
              isLoading={isLoading}
              icon={<UsersIcon />}
              aria-label="Show collaboration menu"
              size="sm"
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
