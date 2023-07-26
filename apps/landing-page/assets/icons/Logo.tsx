import React from 'react'
import { Image, Box, BoxProps } from '@chakra-ui/react'
import newLogo from 'img/chatworth-logo.png' // corrected path to new logo file

export const Logo = (props: BoxProps) => (
  <Box boxSize="50px" {...props}>
    <Image src={newLogo.default} boxSize="100%" objectFit="contain" alt="Logo" />
  </Box>
)

