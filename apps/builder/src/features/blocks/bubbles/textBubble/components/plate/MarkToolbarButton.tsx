import React from 'react'
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate-common'
import { IconButton, IconButtonProps } from '@chakra-ui/react'

type Props = {
  nodeType: string
  clear?: string | string[]
} & IconButtonProps

export const MarkToolbarButton = ({ clear, nodeType, ...rest }: Props) => {
  const state = useMarkToolbarButtonState({ clear, nodeType })
  const { props } = useMarkToolbarButton(state)

  return (
    <IconButton
      size="sm"
      variant={props.pressed ? 'outline' : 'ghost'}
      colorScheme={props.pressed ? 'orange' : undefined}
      {...props}
      {...rest}
    />
  )
}
