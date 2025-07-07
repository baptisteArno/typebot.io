import React from 'react'
import { IMjmlButtonProps, MjmlButton } from '@faire/mjml-react'
import { grayLight } from '../theme'
import { leadingTight, textBase, borderBase } from '../theme'

type ButtonProps = {
  link: string
  children: React.ReactNode
} & IMjmlButtonProps

export const Button = ({ link, children, ...props }: ButtonProps) => (
  <MjmlButton
    lineHeight={leadingTight}
    fontSize={textBase}
    fontWeight="700"
    height={32}
    padding="0"
    align="left"
    href={link}
    backgroundColor={'orange'}
    color={grayLight}
    borderRadius={borderBase}
    {...props}
  >
    {children}
  </MjmlButton>
)
