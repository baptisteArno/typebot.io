import {
  ButtonProps,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react'
import { MoreVerticalIcon } from 'assets/icons'
import { ReactNode } from 'react'

type Props = { children: ReactNode } & ButtonProps

export const MoreButton = ({ children, ...props }: Props) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<MoreVerticalIcon />}
        onMouseUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        colorScheme="gray"
        variant="outline"
        size="sm"
        {...props}
      />
      <MenuList>{children}</MenuList>
    </Menu>
  )
}
