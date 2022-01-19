import {
  IconButton,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { DownloadIcon, MoreVerticalIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useState } from 'react'
import { parseDefaultPublicId } from 'services/typebots'

export const BoardMenuButton = (props: MenuButtonProps) => {
  const { typebot } = useTypebot()
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadFlow = () => {
    if (!typebot) return
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
        variant="outline"
        colorScheme="blue"
        icon={<MoreVerticalIcon transform={'rotate(90deg)'} />}
        isLoading={isDownloading}
        {...props}
      />
      <MenuList>
        <MenuItem icon={<DownloadIcon />} onClick={downloadFlow}>
          Export flow
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
