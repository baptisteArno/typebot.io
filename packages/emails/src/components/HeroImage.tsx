import { IMjmlImageProps, MjmlImage } from '@faire/mjml-react'
import { borderBase } from '../theme'

export const HeroImage = (props: IMjmlImageProps) => (
  <MjmlImage
    cssClass="hero"
    padding="0"
    align="left"
    borderRadius={borderBase}
    {...props}
  />
)
