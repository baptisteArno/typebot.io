import { Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { PaymentInputBlock } from '@typebot.io/schemas'
import { defaultPaymentInputOptions } from '@typebot.io/schemas/features/blocks/inputs/payment/constants'

type Props = {
  block: PaymentInputBlock
}

export const PaymentInputContent = ({ block }: Props) => {
  const { t } = useTranslate()

  if (!block.options?.amount || !block.options.credentialsId)
    return (
      <Text color="gray.500">
        {t('blocks.inputs.payment.placeholder.label')}
      </Text>
    )
  return (
    <Text noOfLines={1} pr="6">
      {t('blocks.inputs.payment.collect.label')} {block.options.amount}{' '}
      {block.options.currency ?? defaultPaymentInputOptions.currency}
    </Text>
  )
}
