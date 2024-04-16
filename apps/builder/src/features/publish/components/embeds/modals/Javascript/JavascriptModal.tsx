import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { EmbedModal } from '../../EmbedModal'
import { JavascriptInstructions } from './instructions/JavascriptInstructions'
import { isDefined } from '@typebot.io/lib/utils'

export const JavascriptModal = ({
  isOpen,
  onClose,
  isPublished,
}: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <EmbedModal
      titlePrefix="Javascript"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <JavascriptInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  )
}
