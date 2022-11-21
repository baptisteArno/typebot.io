import React from 'react'
import { MjmlButton } from '@faire/mjml-react'
import { blue, grayLight } from '../theme'
import { leadingTight, textBase, borderBase } from '../theme'

type ButtonProps = {
  link: string
  children: React.ReactNode
}

export const Button = ({ link, children }: ButtonProps) => (
  <MjmlButton
    lineHeight={leadingTight}
    fontSize={textBase}
    fontWeight="700"
    height={32}
    padding="0"
    align="left"
    href={link}
    backgroundColor={blue}
    color={grayLight}
    borderRadius={borderBase}
  >
    {children}
  </MjmlButton>
)
