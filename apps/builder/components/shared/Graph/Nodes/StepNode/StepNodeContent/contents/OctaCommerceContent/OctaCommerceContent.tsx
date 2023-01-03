import { Step, StepOptions } from 'models'
import React from 'react'

type Props = {
  step: Step,
  options: StepOptions
}

const OctaCommerceContent = ({ step, options }: Props) => {
  console.log("Step => ", step);
  
  return (
    <div>Selecione os produtos a serem enviados</div>
  )
}

export default OctaCommerceContent