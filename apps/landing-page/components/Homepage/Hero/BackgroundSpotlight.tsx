import { Box, BoxProps } from '@chakra-ui/react'
import React from 'react'
import Image from 'next/image'
import spotlightSrc from 'public/images/homepage/spotlight.png'

export const BackgroundSpotlight = (props: BoxProps) => (
  <Box {...props}>
    <Image src={spotlightSrc} alt="spotlight" />
  </Box>
)
