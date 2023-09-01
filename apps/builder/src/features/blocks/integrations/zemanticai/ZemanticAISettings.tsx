import { TextInput, Textarea } from '@/components/inputs'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormControl,
  FormLabel,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { isEmpty } from '@typebot.io/lib'
import { Variable, ZemanticAIBlock } from '@typebot.io/schemas'
import { ZemanticAICredentialsModal } from './ZemanticAICredentialsModal'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'

type Props = {
  options?: ZemanticAIBlock['options']
  onOptionsChange: (options: ZemanticAIBlock['options']) => void
}

export const ZemanticAISettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const updateProjectId = (projectId: string) => {
    onOptionsChange({
      ...options,
      projectId: isEmpty(projectId) ? undefined : projectId,
    })
  }

  const updateQuery = (query: string) => {
    onOptionsChange({
      ...options,
      query: isEmpty(query) ? undefined : query,
    })
  }

  const updateSystemPrompt = (systemPrompt: string) => {
    onOptionsChange({
      ...options,
      systemPrompt: isEmpty(systemPrompt) ? undefined : systemPrompt,
    })
  }

  const updatePrompt = (prompt: string) => {
    onOptionsChange({
      ...options,
      prompt: isEmpty(prompt) ? undefined : prompt,
    })
  }

  const updateVariableToSave = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableToSave: variable?.id,
    })
  }

  return (
    <Stack spacing={4}>
      {workspace && (
        <CredentialsDropdown
          type="zemanticai"
          workspaceId={workspace.id}
          currentCredentialsId={options?.credentialsId}
          onCredentialsSelect={updateCredentialsId}
          onCreateNewClick={onOpen}
          credentialsName="Zemantic AI account"
        />
      )}
      <ZemanticAICredentialsModal
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentialsId}
      />
      <TextInput
        defaultValue={options?.projectId ?? ''}
        onChange={updateProjectId}
        withVariableButton={false}
        placeholder="Project ID"
      />
      <TextInput
        defaultValue={options?.query ?? ''}
        onChange={updateQuery}
        withVariableButton={true}
        placeholder="Question"
      />
      <Accordion>
        <AccordionItem>
          <AccordionButton>
            <Text w="full" textAlign="left">
              Prompt Settings (Optional)
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Textarea
              defaultValue={options?.systemPrompt ?? ''}
              onChange={updateSystemPrompt}
              placeholder="System Prompt"
              withVariableButton={true}
            />
            <Textarea
              defaultValue={options?.prompt ?? ''}
              onChange={updatePrompt}
              placeholder="Prompt"
              withVariableButton={true}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <FormControl>
        <FormLabel htmlFor="value">Save response in variable:</FormLabel>
        <VariableSearchInput
          onSelectVariable={updateVariableToSave}
          placeholder="Search for a variable"
          initialVariableId={options?.variableToSave}
        />
      </FormControl>
    </Stack>
  )
}
