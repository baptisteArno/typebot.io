import { useNavMenu } from './useNavMenu'
import {
  Box,
  Collapse,
  SimpleGrid,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import * as React from 'react'
import { Link } from './_data'
import { NavLink } from './NavLink'
import { NavMenu } from './NavMenu'
import { SubmenuItem as DesktopMenuItem } from './SubmenuItem'
import { ChevronDownIcon } from '../../../assets/icons/ChevronDownIcon'

interface SubmenuProps {
  link: Link
}

const DesktopSubmenu = (props: SubmenuProps) => {
  const { link } = props
  const { isOpen, getMenuProps, getTriggerProps } = useNavMenu()
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Button
        rightIcon={<ChevronDownIcon />}
        variant="ghost"
        colorScheme="gray"
        {...getTriggerProps()}
      >
        {link.label}
      </Button>
      <NavMenu {...getMenuProps()} animate={isOpen ? 'open' : 'closed'}>
        <Box maxW="7xl" mx="auto" px="8">
          <SimpleGrid spacing="10" columns={2}>
            {link.children?.map((item, idx) => (
              <DesktopMenuItem
                key={idx}
                title={item.label}
                href={item.href ?? '#'}
                icon={item.icon}
              >
                {item.description}
              </DesktopMenuItem>
            ))}
          </SimpleGrid>
        </Box>
      </NavMenu>
    </>
  )
}

const MobileSubMenu = (props: SubmenuProps) => {
  const { link } = props
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box>
      <Button
        textAlign="start"
        type="button"
        cursor="pointer"
        onClick={onToggle}
        paddingEnd="4"
        variant="ghost"
        colorScheme="gray"
        h="3rem"
        w="full"
        justifyContent="flex-start"
      >
        <Box mr="4">{link.label}</Box>
        <Box
          as={ChevronDownIcon}
          transform={`rotate(${isOpen ? '180deg' : '0deg'})`}
        />
      </Button>
      <Collapse in={isOpen}>
        <Box pl="5">
          {link.children?.map((item, idx) => (
            <NavLink.Mobile key={idx} href={item.href ?? '#'}>
              {item.label}
            </NavLink.Mobile>
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

export const Submenu = {
  Mobile: MobileSubMenu,
  Desktop: DesktopSubmenu,
}
