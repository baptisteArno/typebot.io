import { MjmlImageProps, MjmlImage } from '@faire/mjml-react'
import React from 'react'
import { borderBase } from '../theme'

export const HeroImage = (props: MjmlImageProps) => (
  <MjmlImage
    cssClass="hero"
    padding="0"
    align="left"
    borderRadius={borderBase}
    {...props}
  >
    {props.children}
  </MjmlImage>
)
