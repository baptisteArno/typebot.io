import { Box } from '@chakra-ui/react'
import * as React from 'react'
import { NavContent } from './NavContent'
import { links } from './_data'

export const Navbar = () => {
  return (
    <Box w="full">
      <Box as="header" position="relative" zIndex="10">
        <Box
          as="nav"
          aria-label="Main navigation"
          maxW="7xl"
          mx="auto"
          px={{ base: '6', md: '8' }}
          py="4"
        >
          <NavContent.Mobile
            display={{ base: 'flex', lg: 'none' }}
            links={links}
          />
          <NavContent.Desktop
            display={{ base: 'none', lg: 'flex' }}
            links={links}
          />
        </Box>
      </Box>
    </Box>
  )
}
