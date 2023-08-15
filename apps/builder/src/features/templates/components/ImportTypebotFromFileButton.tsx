import { useToast } from '@/hooks/useToast'
import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import { groupSchema, Typebot } from '@typebot.io/schemas'
import React, { ChangeEvent } from 'react'
import { useScopedI18n } from '@/locales'
import { z } from 'zod'

type Props = {
  onNewTypebot: (typebot: Typebot) => void
} & ButtonProps

export const ImportTypebotFromFileButton = ({
  onNewTypebot,
  ...props
}: Props) => {
  const scopedT = useScopedI18n('templates.importFromFileButon')
  const { showToast } = useToast()

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    const file = e.target.files[0]
    const fileContent = await readFile(file)
    try {
      const typebot = JSON.parse(fileContent)
      z.array(groupSchema).parse(typebot.groups)
      onNewTypebot(typebot)
    } catch (err) {
      console.error(err)
      showToast({
        description: scopedT('toastError.description'),
        details: {
          content: JSON.stringify(err, null, 2),
          lang: 'json',
        },
      })
    }
  }

  return (
    <>
      <chakra.input
        type="file"
        id="file-input"
        display="none"
        onChange={handleInputChange}
        accept=".json"
      />
      <Button as="label" htmlFor="file-input" cursor="pointer" {...props}>
        {props.children}
      </Button>
    </>
  )
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      fr.result && resolve(fr.result.toString())
    }
    fr.onerror = reject
    fr.readAsText(file)
  })
}
