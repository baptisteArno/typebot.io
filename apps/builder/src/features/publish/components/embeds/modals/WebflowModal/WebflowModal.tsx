import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { WebflowInstructions } from './instructions/WebflowInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const WebflowModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()

  return (
    <EmbedModal
      titlePrefix="Webflow"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <WebflowInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
