import { TextInput, Textarea, NumberInput } from '@/components/inputs'
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
import { Variable, ZemanticAiBlock } from '@typebot.io/schemas'
import { ZemanticAiCredentialsModal } from './ZemanticAiCredentialsModal'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'

type Props = {
  options?: ZemanticAiBlock['options']
  onOptionsChange: (options: ZemanticAiBlock['options']) => void
}

export const ZemanticAiSettings = ({ options, onOptionsChange }: Props) => {
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

  const updateMaxResults = (
    maxResults: number | `{{${string}}}` | undefined
  ) => {
    onOptionsChange({
      ...options,
      maxResults: maxResults as number,
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

  const updateResultsVariableToSave = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      resultsVariable: variable?.id,
    })
  }

  const updateSummaryVariableToSave = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      summaryVariable: variable?.id,
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
      <ZemanticAiCredentialsModal
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentialsId}
      />
      <TextInput
        label="Project ID:"
        moreInfoTooltip="The project ID containing the documents you want to search."
        defaultValue={options?.projectId ?? ''}
        onChange={updateProjectId}
        withVariableButton={false}
        placeholder="Project ID"
      />
      <TextInput
        label="Question or Query:"
        moreInfoTooltip="The question or query you want to ask or search against the documents in the project."
        defaultValue={options?.query ?? ''}
        onChange={updateQuery}
        withVariableButton={true}
        placeholder="Question"
      />
      <NumberInput
        label="Max Results:"
        moreInfoTooltip="The maximum number of document chunk results to return from your search."
        direction="column"
        defaultValue={options?.maxResults}
        onValueChange={updateMaxResults}
        placeholder="Default: 3"
      />
      <Accordion allowMultiple={true}>
        <AccordionItem>
          <AccordionButton>
            <Text w="full" textAlign="left">
              Prompt Settings (Optional)
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} as={Stack} spacing={6}>
            <Textarea
              label="System Prompt:"
              moreInfoTooltip="System prompt to send to the summarization LLM. This is prepended to the prompt and helps guide system behavior."
              defaultValue={options?.systemPrompt ?? ''}
              onChange={updateSystemPrompt}
              placeholder="System Prompt"
              withVariableButton={true}
            />
            <Textarea
              label="Prompt:"
              moreInfoTooltip="Prompt to send to the summarization LLM."
              defaultValue={options?.prompt ?? ''}
              onChange={updatePrompt}
              placeholder="Prompt"
              withVariableButton={true}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <FormControl>
        <FormLabel>Save results to variable:</FormLabel>
        <VariableSearchInput
          onSelectVariable={updateResultsVariableToSave}
          placeholder="Search for a variable"
          initialVariableId={options?.resultsVariable}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Save summary to variable:</FormLabel>
        <VariableSearchInput
          onSelectVariable={updateSummaryVariableToSave}
          placeholder="Search for a variable"
          initialVariableId={options?.summaryVariable}
        />
      </FormControl>
    </Stack>
  )
}
