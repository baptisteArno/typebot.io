import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { WixInstructions } from './instructions/WixInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const WixModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()

  return (
    <EmbedModal
      titlePrefix="Wix"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <WixInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
