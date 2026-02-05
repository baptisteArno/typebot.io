import {
  Stack,
  Button,
  HStack,
  IconButton,
  Text,
  Tooltip,
  Checkbox,
} from '@chakra-ui/react'
import {
  DeclareVariablesBlock,
  Variable,
  DeclaredVariable,
} from '@typebot.io/schemas'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TextInput } from '@/components/inputs'
import { TrashIcon, PlusIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'

type Props = {
  options: DeclareVariablesBlock['options']
  onOptionsChange: (options: DeclareVariablesBlock['options']) => void
}

export const DeclareVariablesSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const { updateVariable } = useTypebot()
  const variables = options?.variables ?? []

  const addVariable = () => {
    onOptionsChange({
      ...options,
      variables: [
        ...variables,
        { variableId: '', description: '', required: true },
      ],
    })
  }

  const updateDeclaredVariable = (
    index: number,
    update: Partial<DeclaredVariable>
  ) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], ...update }
    onOptionsChange({ ...options, variables: updated })
  }

  const removeVariable = (index: number) => {
    onOptionsChange({
      ...options,
      variables: variables.filter((_, i) => i !== index),
    })
  }

  const handleVariableSelect = (
    index: number,
    variable?: Pick<Variable, 'id' | 'name'>
  ) => {
    if (!variable?.id) return

    // Mark the variable as an input variable
    updateVariable(variable.id, { isInputVariable: true })

    updateDeclaredVariable(index, {
      variableId: variable.id,
    })
  }

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.600">
        Declare variables that your AI agent must provide when starting a flow.
      </Text>

      {variables.map((variable, index) => (
        <Stack key={index} p={3} borderWidth={1} rounded="md" spacing={3}>
          <HStack>
            <VariableSearchInput
              initialVariableId={variable.variableId}
              onSelectVariable={(v) => handleVariableSelect(index, v)}
              placeholder="Select or create variable"
            />
            <Tooltip label="Remove variable">
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove"
                size="sm"
                onClick={() => removeVariable(index)}
                variant="ghost"
                colorScheme="red"
              />
            </Tooltip>
          </HStack>
          <TextInput
            label="Description (required)"
            defaultValue={variable.description}
            onChange={(description) =>
              updateDeclaredVariable(index, { description })
            }
            placeholder="Describe what this variable should contain"
            isRequired
          />
          <Checkbox
            isChecked={variable.required ?? true}
            onChange={(e) =>
              updateDeclaredVariable(index, { required: e.target.checked })
            }
          >
            Required (agent must provide this value)
          </Checkbox>
        </Stack>
      ))}

      <Button
        leftIcon={<PlusIcon />}
        onClick={addVariable}
        size="sm"
        variant="outline"
      >
        Add Input Variable
      </Button>
    </Stack>
  )
}
