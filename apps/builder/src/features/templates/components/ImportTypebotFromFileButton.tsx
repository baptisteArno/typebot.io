import { useToast } from '@/hooks/useToast'
import { readFile } from '@/utils/helpers'
import { Button, ButtonProps, chakra } from '@chakra-ui/react'
import { Typebot } from 'models'
import React, { ChangeEvent } from 'react'

type Props = {
  onNewTypebot: (typebot: Typebot) => void
} & ButtonProps

export const ImportTypebotFromFileButton = ({
  onNewTypebot,
  ...props
}: Props) => {
  const { showToast } = useToast()

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    const file = e.target.files[0]
    const fileContent = await readFile(file)
    try {
      onNewTypebot(JSON.parse(fileContent))
    } catch (err) {
      console.error(err)
      showToast({ description: 'Failed to parse the file' })
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
