import { Step, StepOptions, StepWithOptions } from 'models'
import React from 'react'
import { SelectedProducts } from './OctaCommerceContent.style'

type Props = {
  step: StepWithOptions,
  options: StepOptions
}

const OctaCommerceContent = ({ step, options }: Props) => {
  return (
    <div>
      Selecione os produtos a serem enviados
      {/* {step.options && <>Produtos selecionados: <SelectedProducts>{step.options[0]}</SelectedProducts> produtos</>} */}
    </div>
  )
}

export default OctaCommerceContent