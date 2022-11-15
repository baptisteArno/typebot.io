import {
  ButtonProps,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react'
import { MoreVerticalIcon } from '@/components/icons'
import { ReactNode } from 'react'

type Props = { children: ReactNode } & ButtonProps

export const MoreButton = ({ children, ...props }: Props) => {
  return (
    <Menu isLazy>
      <MenuButton
        data-testid="more-button"
        as={IconButton}
        icon={<MoreVerticalIcon />}
        onClick={(e) => e.stopPropagation()}
        colorScheme="gray"
        variant="outline"
        size="sm"
        {...props}
      />
      <MenuList>{children}</MenuList>
    </Menu>
  )
}
