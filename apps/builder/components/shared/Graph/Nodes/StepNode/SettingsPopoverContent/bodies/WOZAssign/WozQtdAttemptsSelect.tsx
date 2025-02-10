import { Stack, Text } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'

const WozQtdAttemptsSelect = ({
  onChange,
  selectedValue,
}: {
  onChange: Function
  selectedValue: number
}) => {
  const options = [
    { key: 3, value: 3, label: '3' },
    { key: 4, value: 4, label: '4' },
    { key: 5, value: 5, label: '5' },
  ]
  return (
    <Stack>
      <Text>Quantidade de tentativas de resposta antes de direcionar</Text>

      <OctaSelect
        defaultSelected={selectedValue || 3}
        findable
        options={options}
        onChange={(v) => onChange(v)}
      />
      <Text variant={'hint'}>
        Se o WOZ não souber responder, ele irá direcionar o atendimento
        automaticamente após quantidade de tentativas selecionada.{' '}
      </Text>
    </Stack>
  )
}

export default WozQtdAttemptsSelect
