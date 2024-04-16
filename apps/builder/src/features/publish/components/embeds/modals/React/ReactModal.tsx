import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { ReactInstructions } from './instructions/ReactInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const ReactModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <EmbedModal
      titlePrefix="React"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <ReactInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
