import { TextInput } from '@/components/inputs'
import { Select } from '@/components/inputs/Select'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import {
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import { createId } from '@paralleldrive/cuid2'
import { TriggerWhatsappFlowBlock } from '@typebot.io/schemas'
import { TriggerWhatsappFlowVariableMapping } from '@typebot.io/schemas/features/blocks/logic/triggerWhatsappFlow/schema'
import React from 'react'

type Props = {
  options: TriggerWhatsappFlowBlock['options']
  onOptionsChange: (options: TriggerWhatsappFlowBlock['options']) => void
}

export const TriggerWhatsappFlowSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const { workspace } = useWorkspace()

  const { data: flowsData, isLoading: isLoadingFlows } =
    trpc.triggerWhatsappFlow.listWhatsappFlows.useQuery(
      { workspaceId: workspace?.id as string },
      { enabled: !!workspace?.id }
    )

  const { data: variablesData, isLoading: isLoadingVariables } =
    trpc.triggerWhatsappFlow.getWhatsappFlowVariables.useQuery(
      {
        workspaceId: workspace?.id as string,
        flowId: options?.flowId as string,
      },
      { enabled: !!workspace?.id && !!options?.flowId }
    )

  const updateFlow = (flowId: string | undefined, item?: { label: string }) => {
    if (flowId === options?.flowId) return
    // A new flow declares its own fields — mappings against the previous
    // flow's field names would silently point at nothing.
    onOptionsChange({
      ...options,
      flowId,
      flowName: item?.label,
      variableMapping: [],
    })
  }

  const updateBody = (body: string) => onOptionsChange({ ...options, body })
  const updateCta = (cta: string) => onOptionsChange({ ...options, cta })

  const updateFieldMapping = (
    fieldName: string,
    fieldType: string,
    variable?: { id: string }
  ) => {
    const existingMapping = options?.variableMapping ?? []
    const withoutField = existingMapping.filter(
      (mapping) => mapping.fieldName !== fieldName
    )
    const newMapping: TriggerWhatsappFlowVariableMapping[] = variable
      ? [
          ...withoutField,
          {
            id:
              existingMapping.find((mapping) => mapping.fieldName === fieldName)
                ?.id ?? createId(),
            fieldName,
            fieldType,
            variableId: variable.id,
          },
        ]
      : withoutField
    onOptionsChange({ ...options, variableMapping: newMapping })
  }

  return (
    <Stack spacing={4}>
      <FormControl as={Stack}>
        <FormLabel mb="0" htmlFor="flow">
          Flow:
        </FormLabel>
        <Select
          selectedItem={options?.flowId}
          items={(flowsData?.flows ?? []).map((flow) => ({
            label: flow.name,
            value: flow.id,
          }))}
          onSelect={updateFlow}
          placeholder={
            isLoadingFlows ? 'Loading flows...' : 'Select a WhatsApp Flow'
          }
        />
      </FormControl>

      {options?.flowId && (
        <>
          <TextInput
            label="Message:"
            defaultValue={options?.body}
            placeholder="Fill out this form to continue"
            onChange={updateBody}
          />
          <TextInput
            label="Button text:"
            defaultValue={options?.cta}
            placeholder="Start"
            onChange={updateCta}
          />

          <Divider />

          <Text fontSize="sm" fontWeight="semibold">
            Variables
          </Text>
          {isLoadingVariables && (
            <Text fontSize="sm" color="gray.500">
              Loading the flow&apos;s fields...
            </Text>
          )}
          {!isLoadingVariables && variablesData?.fields.length === 0 && (
            <Text fontSize="sm" color="gray.500">
              This flow doesn&apos;t declare any input fields.
            </Text>
          )}
          {variablesData?.fields.map((field) => (
            <Stack
              key={field.name}
              p="4"
              rounded="md"
              borderWidth="1px"
              spacing="2"
            >
              <Stack direction="row" align="center" spacing="2">
                <Text fontWeight="medium" fontSize="sm">
                  {field.name}
                </Text>
                <Tag size="sm">{field.type}</Tag>
              </Stack>
              <VariableSearchInput
                initialVariableId={
                  options?.variableMapping?.find(
                    (mapping) => mapping.fieldName === field.name
                  )?.variableId
                }
                onSelectVariable={(variable) =>
                  updateFieldMapping(field.name, field.type, variable)
                }
                placeholder="Search for a variable"
              />
            </Stack>
          ))}
        </>
      )}
    </Stack>
  )
}
