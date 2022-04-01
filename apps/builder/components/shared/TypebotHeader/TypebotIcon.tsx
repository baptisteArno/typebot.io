import { ToolIcon } from 'assets/icons'
import React from 'react'
import { chakra, Image } from '@chakra-ui/react'

type Props = {
  icon?: string | null
  emojiFontSize?: string
  boxSize?: string
}

export const TypebotIcon = ({
  icon,
  boxSize = '25px',
  emojiFontSize,
}: Props) => {
  return (
    <>
      {icon ? (
        icon.startsWith('http') ? (
          <Image
            src={icon}
            boxSize={boxSize}
            objectFit={icon.endsWith('.svg') ? undefined : 'cover'}
            alt="typebot icon"
            rounded="md"
          />
        ) : (
          <chakra.span role="img" fontSize={emojiFontSize}>
            {icon}
          </chakra.span>
        )
      ) : (
        <ToolIcon boxSize={boxSize} />
      )}
    </>
  )
}
