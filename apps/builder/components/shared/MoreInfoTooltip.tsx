import { Tooltip, chakra } from '@chakra-ui/react'
import { HelpCircleIcon } from 'assets/icons'
import React from 'react'

type Props = {
  children: React.ReactNode
}

export const MoreInfoTooltip = ({ children }: Props) => {
  return (
    <Tooltip label={children}>
      <chakra.span cursor="pointer">
        <HelpCircleIcon />
      </chakra.span>
    </Tooltip>
  )
}
