import { TextInput } from '@/components/inputs'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { Stack } from '@chakra-ui/react'
import { CustomFont } from '@typebot.io/schemas'

type Props = {
  font: CustomFont
  onFontChange: (font: CustomFont) => void
}

export const CustomFontForm = ({ font, onFontChange }: Props) => {
  const updateFamily = (family: string) => onFontChange({ ...font, family })
  const updateCss = (css: string) => onFontChange({ ...font, css })
  return (
    <Stack>
      <TextInput
        direction="row"
        label="Family:"
        placeholder='MyAwesomeWebFont, "Helvetica Neue", sans-serif'
        defaultValue={font.family}
        onChange={updateFamily}
        withVariableButton={false}
      />
      <CodeEditor
        onChange={updateCss}
        defaultValue={font.css}
        lang="css"
        placeholder={`@font-face {
  font-family: 'MyAwesomeWebFont';
  src: url('https://example.com/webfont.woff') format('woff'),
    url('https://example.com/webfont.ttf') format('truetype');
}`}
        maxHeight="200px"
      />
    </Stack>
  )
}
