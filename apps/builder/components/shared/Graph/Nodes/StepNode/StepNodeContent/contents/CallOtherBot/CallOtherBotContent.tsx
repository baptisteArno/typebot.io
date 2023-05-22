import React from 'react'
import { CallOtherBotOptions, CallOtherBot, CallOtherBotStep } from 'models'
import { TableListOcta } from 'components/shared/TableListOcta'
import { CallOtherBotContentItems } from './CallOtherBotContentItems'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  options: CallOtherBotOptions['botToCall']
  step: CallOtherBotStep
}

export const CallOtherBotContent = ({
  options,
  step,
}: Props) => {
  const itemContent = { botToCall: [{ id: 'asd' }] }
  return (
    <TableListOcta<CallOtherBot>
      initialItems={itemContent.botToCall}
      Item={CallOtherBotContentItems}
    />
  )
}
