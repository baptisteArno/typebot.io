import React from 'react'
import { IconButton, IconButtonProps } from '@chakra-ui/react'
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link'

type Props = IconButtonProps

export const LinkToolbarButton = ({ ...rest }: Props) => {
  const state = useLinkToolbarButtonState()
  const { props } = useLinkToolbarButton(state)

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
