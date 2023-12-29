import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from '@chakra-ui/react'
import { UsersIcon } from '@/components/icons'
import React from 'react'
import { SharePopoverContent } from './SharePopoverContent'
import { useTranslate } from '@tolgee/react'

export const ShareTypebotButton = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslate()

  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Button
          isLoading={isLoading}
          leftIcon={<UsersIcon />}
          aria-label={t('share.button.popover.ariaLabel')}
          size="sm"
        >
          {t('share.button.label')}
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
