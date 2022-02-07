import { chakra, MenuItem, MenuItemProps, useToast } from '@chakra-ui/react'
import { FileIcon } from 'assets/icons'
import { Typebot } from 'models'
import React, { ChangeEvent, useState } from 'react'
import { readFile } from 'services/utils'

type Props = {
  onNewTypebot: (typebot: Typebot) => void
} & MenuItemProps

export const ImportFromFileMenuItem = ({ onNewTypebot, ...props }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    setIsLoading(true)
    const file = e.target.files[0]
    const fileContent = await readFile(file)
    try {
      onNewTypebot(JSON.parse(fileContent))
    } catch (err) {
      console.error(err)
      toast({ description: 'Failed to parse the file' })
    }
    setIsLoading(false)
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
      <MenuItem
        icon={<FileIcon />}
        id="file-input"
        isLoading={isLoading}
        {...props}
      >
        {props.children}
      </MenuItem>
    </>
  )
}
