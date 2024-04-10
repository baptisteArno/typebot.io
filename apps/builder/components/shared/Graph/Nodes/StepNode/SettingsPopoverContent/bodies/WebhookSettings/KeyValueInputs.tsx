import { Stack, FormLabel, IconButton } from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { TableListItemProps } from 'components/shared/TableList'
import { QueryParameters } from 'models'
import { useTypebot } from 'contexts/TypebotContext'
import { TrashIcon } from 'assets/icons'

export const QueryParamsInputs = (
  props: TableListItemProps<QueryParameters>
) => (
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
  onRemoveItem,
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
    onItemChange({ ...item, key, isNew: true, type: 'query' })
  }

  const handleValueChange = (value: string) => {
    if (value === item.value) return
    const name = value.replace('{{', '').replace('}}', '')
    const variable =
      typebot?.variables.filter((item) => item.token === name) || []
    onItemChange({ ...item, value, properties: variable[0] })
  }

  const onDeleteClick = () => {
    if (onRemoveItem) onRemoveItem(item)
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        icon={<TrashIcon />}
        onClick={onDeleteClick}
        variant="ghost"
        size="sm"
      />

      <FormLabel htmlFor={'key' + item.key}>Chave:</FormLabel>
      <Input
        id={'key' + item.key}
        value={item.key}
        defaultValue={item.key ?? ''}
        onChange={handleKeyChange}
        placeholder={keyPlaceholder}
        debounceTimeout={debounceTimeout}
      />
      <FormLabel htmlFor={'value' + item.value}>Valor:</FormLabel>
      <Input
        id={'value' + item.value}
        value={item.value}
        defaultValue={item.value ?? ''}
        onChange={handleValueChange}
        placeholder={valuePlaceholder}
        debounceTimeout={debounceTimeout}
      />
    </Stack>
  )
}
