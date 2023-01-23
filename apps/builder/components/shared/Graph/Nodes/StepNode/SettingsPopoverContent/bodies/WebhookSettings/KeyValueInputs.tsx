import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { TableListItemProps } from 'components/shared/TableList'
import { KeyValue, QueryParameters, Variable } from 'models'
import { useTypebot } from 'contexts/TypebotContext'

export const QueryParamsInputs = (props: TableListItemProps<QueryParameters>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="Ex. email"
    valuePlaceholder="Ex. {{Email}}"
  />
)

export const HeadersInputs = (props: TableListItemProps<QueryParameters>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="Ex. Content-Type"
    valuePlaceholder="Ex. application/json"
  />
)

export const KeyValueInputs = ({
  item,
  onItemChange,
  keyPlaceholder,
  valuePlaceholder,
  debounceTimeout,
}: TableListItemProps<QueryParameters> & {
  keyPlaceholder?: string
  valuePlaceholder?: string
}) => {

  const { typebot } = useTypebot()

  const handleKeyChange = (key: string) => {
    if (key === item.key) return
    onItemChange({ ...item, key, isNew: true, type: 'query'})
  }

  const handleValueChange = (value: string) => {
    if (value === item.value) return
    const name = value.replace('{{', '').replace('}}', '')
    const variable = typebot?.variables.filter(item => item.token === name) || []
    onItemChange({ ...item, value, properties: variable[0] })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor={'key' + item.key}>Chave:</FormLabel>
        <Input
          id={'key' + item.key}
          defaultValue={item.key ?? ''}
          onChange={handleKeyChange}
          placeholder={keyPlaceholder}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + item.value}>Valor:</FormLabel>
        <Input
          id={'value' + item.value}
          defaultValue={item.value ?? ''}
          onChange={handleValueChange}
          placeholder={valuePlaceholder}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
    </Stack>
  )
}
