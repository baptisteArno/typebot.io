import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { SetVariableOptions, Variable, valueTypes } from '@typebot.io/schemas'
import React from 'react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Select } from '@/components/inputs/Select'

type Props = {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const updateValueType = (type?: string) =>
    onOptionsChange({
      ...options,
      type: type as SetVariableOptions['type'],
    })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Search or create variable:
        </FormLabel>
        <VariableSearchInput
          onSelectVariable={updateVariableId}
          initialVariableId={options.variableId}
          id="variable-search"
        />
      </Stack>

      <Stack>
        <Text mb="0" fontWeight="medium">
          Value:
        </Text>
        <Select
          selectedItem={options.type ?? 'Custom'}
          items={valueTypes}
          onSelect={updateValueType}
        />
        <SetVariableValue options={options} onOptionsChange={onOptionsChange} />
      </Stack>
    </Stack>
  )
}

const SetVariableValue = ({
  options,
  onOptionsChange,
}: {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}): JSX.Element | null => {
  const updateExpression = (expressionToEvaluate: string) =>
    onOptionsChange({ ...options, expressionToEvaluate })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({
      ...options,
      isExecutedOnClient,
    })

  const updateItemVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseItemVariableId: variable?.id,
      },
    })

  const updateBaseListVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseListVariableId: variable?.id,
      },
    })

  const updateTargetListVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        targetListVariableId: variable?.id,
      },
    })

  switch (options.type) {
    case 'Custom':
    case undefined:
      return (
        <>
          <CodeEditor
            defaultValue={options.expressionToEvaluate ?? ''}
            onChange={updateExpression}
            lang="javascript"
          />
          <SwitchWithLabel
            label="Execute on client?"
            moreInfoContent="Check this if you need access to client-only variables like `window` or `document`."
            initialValue={options.isExecutedOnClient ?? false}
            onCheckChange={updateClientExecution}
          />
        </>
      )
    case 'Map item with same index': {
      return (
        <Stack p="2" rounded="md" borderWidth={1}>
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.baseItemVariableId}
            onSelectVariable={updateItemVariableId}
            placeholder="Base item"
          />
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.baseListVariableId}
            onSelectVariable={updateBaseListVariableId}
            placeholder="Base list"
          />
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.targetListVariableId}
            onSelectVariable={updateTargetListVariableId}
            placeholder="Target list"
          />
        </Stack>
      )
    }
    case 'Random ID':
    case 'Today':
    case 'Tomorrow':
    case 'User ID':
    case 'Yesterday':
    case 'Empty':
      return null
  }
}
