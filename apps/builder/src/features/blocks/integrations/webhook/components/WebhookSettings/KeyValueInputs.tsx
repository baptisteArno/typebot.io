import { TextInput } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { KeyValue } from '@typebot.io/schemas'

export const QueryParamsInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="e.g. email"
    valuePlaceholder="e.g. {{Email}}"
  />
)

export const HeadersInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="e.g. Content-Type"
    valuePlaceholder="e.g. application/json"
  />
)

export const KeyValueInputs = ({
  item,
  onItemChange,
  keyPlaceholder,
  valuePlaceholder,
}: TableListItemProps<KeyValue> & {
  keyPlaceholder?: string
  valuePlaceholder?: string
}) => {
  const handleKeyChange = (key: string) => {
    if (key === item.key) return
    onItemChange({ ...item, key })
  }
  const handleValueChange = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <TextInput
        label="Key:"
        defaultValue={item.key ?? ''}
        onChange={handleKeyChange}
        placeholder={keyPlaceholder}
      />
      <TextInput
        label="Value:"
        defaultValue={item.value ?? ''}
        onChange={handleValueChange}
        placeholder={valuePlaceholder}
      />
    </Stack>
  )
}
