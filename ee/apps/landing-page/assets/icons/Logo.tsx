import Icon, { IconProps } from '@chakra-ui/icon'
import React from 'react'

export const Logo = (props: IconProps) => (
  <Icon w="50px" h="50px" viewBox="0 0 800 800" {...props}>
    <rect width="800" height="800" rx="80" fill={'#0042DA'} />
    <rect
      x="650"
      y="293"
      width="85.4704"
      height="384.617"
      rx="20"
      transform="rotate(90 650 293)"
      fill="#FF8E20"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M192.735 378.47C216.337 378.47 235.47 359.337 235.47 335.735C235.47 312.133 216.337 293 192.735 293C169.133 293 150 312.133 150 335.735C150 359.337 169.133 378.47 192.735 378.47Z"
      fill="#FF8E20"
    />
    <rect
      x="150"
      y="506.677"
      width="85.4704"
      height="384.617"
      rx="20"
      transform="rotate(-90 150 506.677)"
      fill={'white'}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M607.265 421.206C583.663 421.206 564.53 440.34 564.53 463.942C564.53 487.544 583.663 506.677 607.265 506.677C630.867 506.677 650 487.544 650 463.942C650 440.34 630.867 421.206 607.265 421.206Z"
      fill={'white'}
    />
  </Icon>
)
