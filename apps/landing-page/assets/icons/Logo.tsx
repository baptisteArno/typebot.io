import React from 'react'
import { Image, Box } from '@chakra-ui/react'
import newLogo from '../../img/Log.png' // corrected path to new logo file

export const Logo = (props) => (
  <Box boxSize="50px" {...props}>
    <Image src={newLogo} boxSize="100%" objectFit="contain" alt="Logo" />
  </Box>
)
