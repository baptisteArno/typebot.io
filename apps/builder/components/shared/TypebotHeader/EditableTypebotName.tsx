import {
  Editable,
  EditablePreview,
  EditableInput,
  Tooltip,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

type EditableProps = {
  name: string
  onNewName: (newName: string) => void
}
export const EditableTypebotName = ({ name, onNewName }: EditableProps) => {
  const [localName, setLocalName] = useState(name)

  useEffect(() => {
    if (name !== localName) setLocalName(name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  return (
    <Tooltip label="Rename">
      <Editable value={localName} onChange={setLocalName} onSubmit={onNewName}>
        <EditablePreview
          noOfLines={2}
          cursor="pointer"
          maxW="150px"
          overflow="hidden"
          display="flex"
          alignItems="center"
          fontSize="14px"
        />
        <EditableInput fontSize="14px" />
      </Editable>
    </Tooltip>
  )
}
