import { TextInput } from '@/components/inputs'
import { Stack } from '@chakra-ui/react'
import { CustomFont } from '@typebot.io/schemas'

type Props = {
  font: CustomFont
  onFontChange: (font: CustomFont) => void
}

export const CustomFontForm = ({ font, onFontChange }: Props) => {
  const updateFamily = (family: string) => onFontChange({ ...font, family })
  const updateUrl = (url: string) => onFontChange({ ...font, url })
  return (
    <Stack>
      <TextInput
        direction="row"
        label="Family:"
        defaultValue={font.family}
        onChange={updateFamily}
        withVariableButton={false}
      />
      <TextInput
        direction="row"
        label="URL:"
        defaultValue={font.url}
        onChange={updateUrl}
        withVariableButton={false}
      />
    </Stack>
  )
}
