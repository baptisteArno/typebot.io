import { Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { PaymentInputBlock } from '@typebot.io/schemas'

type Props = {
  block: PaymentInputBlock
}

export const PaymentInputContent = ({ block }: Props) => {
  const { t } = useTranslate()

  if (
    !block.options?.amount ||
    !block.options.credentialsId ||
    !block.options.currency
  )
    return (
      <Text color="gray.500">
        {t('blocks.inputs.payment.placeholder.label')}
      </Text>
    )
  return (
    <Text noOfLines={1} pr="6">
      {t('blocks.inputs.payment.collect.label')} {block.options.amount}{' '}
      {block.options.currency}
    </Text>
  )
}
