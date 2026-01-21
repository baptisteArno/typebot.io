import React from 'react'
import { ValidateCnpjOptions } from '@typebot.io/schemas/features/blocks/logic/validateCnpj'
import { DocumentValidationSettings } from '../../shared/DocumentValidationSettings'

type Props = {
  options: ValidateCnpjOptions | undefined
  onOptionsChange: (options: ValidateCnpjOptions) => void
}

export const ValidateCnpjSettings = ({ options, onOptionsChange }: Props) => {
  return (
    <DocumentValidationSettings
      options={options}
      onOptionsChange={onOptionsChange}
      documentType="cnpj"
    />
  )
}
