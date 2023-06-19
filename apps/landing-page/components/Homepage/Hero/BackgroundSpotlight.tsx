import { Box, BoxProps, Image } from '@chakra-ui/react'
import React from 'react'

export const BackgroundSpotlight = (props: BoxProps) => (
  <Box {...props}>
    <Image src="https://s3.typebot.io/spotlight.png" alt="spotlight" />
  </Box>
)
