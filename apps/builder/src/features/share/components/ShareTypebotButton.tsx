import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from '@chakra-ui/react'
import { UsersIcon } from '@/components/icons'
import React from 'react'
import { SharePopoverContent } from './SharePopoverContent'

export const ShareTypebotButton = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Button
          isLoading={isLoading}
          leftIcon={<UsersIcon />}
          aria-label="Open share popover"
          size="sm"
        >
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent
        shadow="lg"
        width="430px"
        rootProps={{ style: { transform: 'scale(0)' } }}
      >
        <SharePopoverContent />
      </PopoverContent>
    </Popover>
  )
}
