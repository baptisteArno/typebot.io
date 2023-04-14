import { FormLabel, HStack, Stack, Switch, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { SetVariableOptions, Variable } from '@typebot.io/schemas'
import React from 'react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Textarea } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

type Props = {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const updateExpression = (expressionToEvaluate: string) =>
    onOptionsChange({ ...options, expressionToEvaluate })

  const updateExpressionType = () =>
    onOptionsChange({
      ...options,
      isCode: options.isCode ? !options.isCode : true,
    })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({
      ...options,
      isExecutedOnClient,
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
        <HStack justify="space-between">
          <FormLabel mb="0" htmlFor="expression">
            Value:
          </FormLabel>
          <HStack>
            <Text fontSize="sm">Text</Text>
            <Switch
              size="sm"
              isChecked={options.isCode ?? false}
              onChange={updateExpressionType}
            />
            <Text fontSize="sm">Code</Text>
          </HStack>
        </HStack>

        {options.isCode ?? false ? (
          <CodeEditor
            defaultValue={options.expressionToEvaluate ?? ''}
            onChange={updateExpression}
            lang="javascript"
          />
        ) : (
          <Textarea
            id="expression"
            defaultValue={options.expressionToEvaluate ?? ''}
            onChange={updateExpression}
          />
        )}
      </Stack>
      <SwitchWithLabel
        label="Execute on client?"
        moreInfoContent="Check this if you need access to client-only variables like `window` or `document`."
        initialValue={options.isExecutedOnClient ?? false}
        onCheckChange={updateClientExecution}
      />
    </Stack>
  )
}
