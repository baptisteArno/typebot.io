import {
  IconButton,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react'
import { MoreVerticalIcon, EyeIcon, CheckIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { useUser } from 'contexts/UserContext'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { isNotDefined } from 'utils'
import { EditorSettingsModal } from './EditorSettingsModal'

export const BoardMenuButton = (props: MenuButtonProps) => {
  const { query } = useRouter()

  const { save } = useTypebot()

  const { user } = useUser()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { setRightPanel } = useEditor()

  const handlePreviewClick = async () => {
    setRightPanel(RightPanel.PREVIEW)
  }

  const handleToDoListClick = async () => {
    setRightPanel(RightPanel.TODOLIST)
  }

  useEffect(() => {
    window.addEventListener('message', handleEventListeners)

    return () => window.removeEventListener('message', handleEventListeners)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      user &&
      isNotDefined(user.graphNavigation) &&
      isNotDefined(query.isFirstBot)
    )
      onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEventListeners = (e: any): void => {
    if (e.data === 'previewClick') {
      save().then()

      setRightPanel(RightPanel.PREVIEW)
    }
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        bgColor="white"
        icon={<MoreVerticalIcon transform={'rotate(90deg)'} />}
        size="sm"
        shadow="lg"
        {...props}
      />

      <MenuList>
        <MenuItem icon={<EyeIcon />} onClick={handlePreviewClick}>
          Visualizar
        </MenuItem>

        <MenuItem icon={<CheckIcon />} onClick={handleToDoListClick}>
          Lista de pendências
        </MenuItem>
      </MenuList>

      <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
    </Menu>
  )
}
