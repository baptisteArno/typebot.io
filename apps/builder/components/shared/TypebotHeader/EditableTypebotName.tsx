import { Editable, EditablePreview, EditableInput } from '@chakra-ui/editable'
import { Tooltip } from '@chakra-ui/tooltip'
import React from 'react'

type EditableProps = {
  name: string
  onNewName: (newName: string) => void
}
export const EditableTypebotName = ({ name, onNewName }: EditableProps) => {
  return (
    <Tooltip label="Rename">
      <Editable defaultValue={name} onSubmit={onNewName}>
        <EditablePreview
          isTruncated
          cursor="pointer"
          maxW="200px"
          overflow="hidden"
          display="flex"
          alignItems="center"
          minW="100px"
        />
        <EditableInput />
      </Editable>
    </Tooltip>
  )
}
