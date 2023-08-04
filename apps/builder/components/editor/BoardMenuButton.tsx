import {
  IconButton,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react'
import assert from 'assert'
import { DownloadIcon, MoreVerticalIcon, SettingsIcon, EyeIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { useUser } from 'contexts/UserContext'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { parseDefaultPublicId } from 'services/typebots'
import { isNotDefined } from 'utils'
import { EditorSettingsModal } from './EditorSettingsModal'

export const BoardMenuButton = (props: MenuButtonProps) => {
  const { query } = useRouter()
  const { typebot, save } = useTypebot()
  const { user, verifyFeatureToggle } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { setRightPanel } = useEditor()

  const handlePreviewClick = async () => {
    setRightPanel(RightPanel.PREVIEW)
  }

  useEffect(() => {
    window.addEventListener('message', handleEventListeners)

    return () => window.removeEventListener('message', handleEventListeners)
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

  const downloadFlow = () => {
    assert(typebot)
    setIsDownloading(true)
    const data =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(typebot))
    const fileName = `typebot-export-${parseDefaultPublicId(
      typebot.name,
      typebot.id
    )}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', data)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
    setIsDownloading(false)
  }
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        bgColor="white"
        icon={<MoreVerticalIcon transform={'rotate(90deg)'} />}
        isLoading={isDownloading}
        size="sm"
        shadow="lg"
        {...props}
      />
      <MenuList>
        <MenuItem icon={<EyeIcon />} onClick={handlePreviewClick}>
          Visualizar
        </MenuItem>
      </MenuList>
      <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
    </Menu>
  )
}
