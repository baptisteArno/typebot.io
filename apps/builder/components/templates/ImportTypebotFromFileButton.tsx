import { Button, ButtonProps, chakra, useToast } from '@chakra-ui/react'
import { Typebot } from 'models'
import React, { ChangeEvent } from 'react'
import { readFile } from 'services/utils'

type Props = {
  onNewTypebot: (typebot: Typebot) => void
} & ButtonProps

export const ImportTypebotFromFileButton = ({
  onNewTypebot,
  ...props
}: Props) => {
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    const file = e.target.files[0]
    const fileContent = await readFile(file)
    try {
      onNewTypebot(JSON.parse(fileContent))
    } catch (err) {
      console.error(err)
      toast({ description: 'Failed to parse the file' })
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
