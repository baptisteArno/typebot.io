import { Alert, AlertIcon, FormLabel, Stack, Tag, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { SetVariableBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Select } from '@/components/inputs/Select'
import { WhatsAppLogo } from '@/components/logos/WhatsAppLogo'
import {
  defaultSetVariableOptions,
  hiddenTypes,
  valueTypes,
} from '@typebot.io/schemas/features/blocks/logic/setVariable/constants'
import { TextInput } from '@/components/inputs'
import { isDefined } from '@typebot.io/lib'

type Props = {
  options: SetVariableBlock['options']
  onOptionsChange: (options: SetVariableBlock['options']) => void
}

const setVarTypes = valueTypes.filter(
  (type) => !hiddenTypes.includes(type as (typeof hiddenTypes)[number])
)

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      variableId: variable?.id,
    })

  const updateValueType = (type?: string) =>
    onOptionsChange({
      ...options,
      type: type as NonNullable<SetVariableBlock['options']>['type'],
    })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Search or create variable:
        </FormLabel>
        <VariableSearchInput
          onSelectVariable={updateVariableId}
          initialVariableId={options?.variableId}
          id="variable-search"
        />
      </Stack>

      <Stack>
        <Text mb="0" fontWeight="medium">
          Value:
        </Text>
        <Select
          selectedItem={options?.type ?? defaultSetVariableOptions.type}
          items={setVarTypes.map((type) => ({
            label: type,
            value: type,
            icon:
              type === 'Contact name' || type === 'Phone number' ? (
                <WhatsAppLogo />
              ) : undefined,
          }))}
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
  options: SetVariableBlock['options']
  onOptionsChange: (options: SetVariableBlock['options']) => void
}): JSX.Element | null => {
  const updateExpression = (expressionToEvaluate: string) =>
    onOptionsChange({
      ...options,
      type: isDefined(options?.type) ? 'Custom' : undefined,
      expressionToEvaluate,
    })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({
      ...options,
      isExecutedOnClient,
    })

  const updateItemVariableId = (variable?: Variable) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseItemVariableId: variable?.id,
      },
    })
  }

  const updateBaseListVariableId = (variable?: Variable) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseListVariableId: variable?.id,
      },
    })
  }

  const updateTargetListVariableId = (variable?: Variable) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        targetListVariableId: variable?.id,
      },
    })
  }

  const updateItem = (item: string) => {
    if (!options || options.type !== 'Append value(s)') return
    onOptionsChange({
      ...options,
      item,
    })
  }

  switch (options?.type) {
    case 'Custom':
    case undefined:
      return (
        <>
          <CodeEditor
            defaultValue={options?.expressionToEvaluate ?? ''}
            onChange={updateExpression}
            lang="javascript"
          />
          <SwitchWithLabel
            label="Execute on client?"
            moreInfoContent="Check this if you need access to client-only variables like `window` or `document`."
            initialValue={
              options?.isExecutedOnClient ??
              defaultSetVariableOptions.isExecutedOnClient
            }
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
    case 'Append value(s)': {
      return <TextInput defaultValue={options.item} onChange={updateItem} />
    }
    case 'Moment of the day': {
      return (
        <Alert fontSize="sm">
          <AlertIcon />
          <Text>
            Will return either <Tag size="sm">morning</Tag>,{' '}
            <Tag size="sm">afternoon</Tag>,<Tag size="sm">evening</Tag> or{' '}
            <Tag size="sm">night</Tag> based on the current user time.
          </Text>
        </Alert>
      )
    }
    case 'Environment name': {
      return (
        <Alert fontSize="sm">
          <AlertIcon />
          <Text>
            Will return either <Tag size="sm">web</Tag> or{' '}
            <Tag size="sm">whatsapp</Tag>.
          </Text>
        </Alert>
      )
    }
    case 'Contact name':
    case 'Phone number':
    case 'Random ID':
    case 'Now':
    case 'Today':
    case 'Tomorrow':
    case 'User ID':
    case 'Yesterday':
    case 'Empty':
      return null
  }
}
