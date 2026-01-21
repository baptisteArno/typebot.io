import React from 'react'
import { ValidateCpfOptions } from '@typebot.io/schemas/features/blocks/logic/validateCpf'
import { DocumentValidationSettings } from '../../shared/DocumentValidationSettings'

type Props = {
  options: ValidateCpfOptions | undefined
  onOptionsChange: (options: ValidateCpfOptions) => void
}

export const ValidateCpfSettings = ({ options, onOptionsChange }: Props) => {
  return (
    <DocumentValidationSettings
      options={options}
      onOptionsChange={onOptionsChange}
      documentType="cpf"
    />
  )
}
