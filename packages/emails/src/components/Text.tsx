import { MjmlText, IMjmlTextProps } from '@faire/mjml-react'
import { leadingRelaxed, textBase } from '../theme'

export const Text = (props: IMjmlTextProps) => (
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
