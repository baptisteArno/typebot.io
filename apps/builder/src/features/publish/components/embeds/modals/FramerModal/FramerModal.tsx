import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { FramerInstructions } from './instructions/FramerInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const FramerModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()

  return (
    <EmbedModal
      titlePrefix="Framer"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <FramerInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
