import { MjmlText, MjmlTextProps, PaddingProps } from '@faire/mjml-react'
import React from 'react'
import { leadingRelaxed, textBase } from '../theme'

export const Text = (props: MjmlTextProps & PaddingProps) => (
  <MjmlText
    padding="24px 0 0"
    fontSize={textBase}
    lineHeight={leadingRelaxed}
    cssClass="paragraph"
    {...props}
  >
    {props.children}
  </MjmlText>
)
