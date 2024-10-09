import React, { useState } from 'react'
import { StackProps, HStack, Button } from '@chakra-ui/react'
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MARK_STRIKETHROUGH,
} from '@udecode/plate-basic-marks'
import { getPluginType, PlateEditor, Value } from '@udecode/plate-core'
import { LinkToolbarButton } from '@udecode/plate-ui-link'
import { MarkToolbarButton } from '@udecode/plate-ui-toolbar'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  StrikethroughIcon,
  EmojiIcon,
} from 'assets/icons'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { useWorkspace } from 'contexts/WorkspaceContext'

type Props = {
  editor: PlateEditor<Value>
  onVariablesButtonClick: (showDialog: boolean) => void
  onEmojiSelected: (emojiText: string) => void
  wabaHeader?: boolean
} & StackProps

export const ToolBar = ({
  editor,
  onVariablesButtonClick,
  onEmojiSelected,
  wabaHeader = false,
  ...props
}: Props) => {
  const [showPicker, setShowPicker] = useState(false)
  const { workspace } = useWorkspace()

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onVariablesButtonClick(true)
  }

  const handleEmojiIconClick = () => {
    setShowPicker((prevState) => !prevState)
  }

  const handleEmojiSelect = (emoji: any) => {
    setShowPicker(false)
    onEmojiSelected(emoji.native)
  }

  const customI18n = {
    search: 'Pesquisar',
    clear: 'Limpar',
    notfound: 'Nenhum emoji encontrado',
    categories: {
      search: 'Pesquisar resultados',
      recent: 'Emojis recentes',
      smileys: 'Carinhas e Emoções',
      people: 'Pessoas e Corpos',
      nature: 'Animais e Natureza',
      foods: 'Comidas e Bebidas',
      activity: 'Atividades',
      places: 'Viagens e Lugares',
      objects: 'Objetos',
      symbols: 'Símbolos',
      flags: 'Bandeiras',
      custom: 'Customizado',
    },
  }

  return (
    <HStack
      bgColor={'white'}
      borderTopRadius="md"
      p={2}
      w="full"
      boxSizing="border-box"
      borderBottomWidth={1}
      {...props}
    >
      <Button size="sm" onMouseDown={handleVariablesButtonMouseDown}>
        Variáveis
      </Button>
      {!wabaHeader && (
        <>
          <span data-testid="bold-button">
            <MarkToolbarButton
              type={getPluginType(editor, MARK_BOLD)}
              icon={<BoldIcon fontSize="20px" />}
            />
          </span>

          <span data-testid="italic-button">
            <MarkToolbarButton
              type={getPluginType(editor, MARK_ITALIC)}
              icon={<ItalicIcon fontSize="20px" />}
            />
          </span>

          <span data-testid="strikethrough-button">
            <MarkToolbarButton
              type={getPluginType(editor, MARK_STRIKETHROUGH)}
              icon={<StrikethroughIcon fontSize="20px" />}
            />
          </span>
        </>
      )}
      {workspace?.channel === 'web' && (
        <>
          <span data-testid="underline-button">
            <MarkToolbarButton
              type={getPluginType(editor, MARK_UNDERLINE)}
              icon={<UnderlineIcon fontSize="20px" />}
            />
          </span>
          <span data-testid="link-button">
            <LinkToolbarButton icon={<LinkIcon fontSize="20px" />} />
          </span>
        </>
      )}
      <span style={{ position: 'relative' }}>
        <span
          onClick={handleEmojiIconClick}
          style={{
            color: 'gray',
            cursor: 'pointer',
            display: 'inline-block',
            fontSize: '1.4em',
            marginTop: '5px',
          }}
        >
          <EmojiIcon fontSize="20px" />
        </span>
        {showPicker && (
          <div style={{ position: 'absolute', top: '100%', zIndex: 9999 }}>
            <style>{`
              .emoji-mart-preview {
                display: none;
              }
            `}</style>
            <Picker onSelect={handleEmojiSelect} i18n={customI18n} />
          </div>
        )}
      </span>
    </HStack>
  )
}
