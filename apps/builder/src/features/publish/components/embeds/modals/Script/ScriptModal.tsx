import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { ScriptInstructions } from './instructions/ScriptInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const ScriptModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <EmbedModal
      titlePrefix="Script"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <ScriptInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
