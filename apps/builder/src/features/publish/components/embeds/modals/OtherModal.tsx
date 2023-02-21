import React, { useState } from 'react'
import { isDefined } from '@udecode/plate-common'
import { EmbedModal } from '../EmbedModal'
import { JavascriptInstructions } from './Javascript/instructions/JavascriptInstructions'
import { ModalProps } from '../EmbedButton'

export const OtherModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <EmbedModal
      titlePrefix="Other"
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
