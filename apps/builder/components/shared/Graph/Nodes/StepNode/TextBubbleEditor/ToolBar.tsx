import React, { useState } from 'react';
import { StackProps, HStack, Button } from '@chakra-ui/react';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { LinkToolbarButton } from '@udecode/plate-ui-link';
import { MarkToolbarButton } from '@udecode/plate-ui-toolbar';
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon } from 'assets/icons';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { VscSmiley } from 'react-icons/vsc';


type Props = {
  editor: PlateEditor<Value>;
  onVariablesButtonClick: () => void;
} & StackProps;

export const ToolBar = ({
  editor,
  onVariablesButtonClick,
  ...props
}: Props) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onVariablesButtonClick();
  };

  const handleEmojiIconClick = () => {
    setShowPicker((prevState) => !prevState);
  };

  const handleEmojiSelect = (emoji: any) => {
    console.log('Selected emoji:', emoji);
    editor.insertText(emoji.native);
    setShowPicker(false);
  };

  const handlePickerBlur = () => {
    setShowPicker(false);
  };

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
  };

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
      <span data-testid="bold-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_BOLD)}
          icon={<BoldIcon />}
        />
      </span>
      <span data-testid="italic-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_ITALIC)}
          icon={<ItalicIcon />}
        />
      </span>
      <span data-testid="underline-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
        />
      </span>
      <span data-testid="link-button">
        <LinkToolbarButton icon={<LinkIcon />} />
      </span>
      
      <span style={{ position: 'relative' }}>
        <span 
        onClick={handleEmojiIconClick}  
        style={{
          color: 'gray',
          cursor: 'pointer',
          display: 'inline-block',
          fontSize: '1.4em',
          marginTop: '5px'
        }}
        ><VscSmiley/>
        </span>
        {showPicker && (
          <div style={{ position: 'absolute', top: '100%', zIndex: 9999 }}>
              <style>{`
              .emoji-mart-preview {
                display: none;
              }
            `}</style>
            <Picker onSelect={handleEmojiSelect}  i18n={customI18n}  />
          </div>
        )}
      </span>
    </HStack>
  );
};
