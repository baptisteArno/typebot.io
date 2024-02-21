import { Font } from '@typebot.io/schemas'
import { GoogleFontForm } from './GoogleFontForm'
import { CustomFontForm } from './CustomFontForm'

type Props = {
  font: Font
  onFontChange: (font: Font) => void
}

export const FontForm = ({ font, onFontChange }: Props) => {
  if (typeof font === 'string' || font.type === 'Google')
    return <GoogleFontForm font={font} onFontChange={onFontChange} />
  if (font.type === 'Custom')
    return <CustomFontForm font={font} onFontChange={onFontChange} />
}
