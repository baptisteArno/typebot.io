import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { NextjsInstructions } from './instructions/NextjsInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const NextjsModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <EmbedModal
      titlePrefix="Next.js"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <NextjsInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
