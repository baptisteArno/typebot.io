import {
  Stack,
  useDisclosure,
  Text,
  Flex,
  HStack,
  Switch,
  FormLabel,
} from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { SendEmailOptions, Variable } from '@typebot.io/schemas'
import React from 'react'
import { env, isNotEmpty } from '@typebot.io/lib'
import { SmtpConfigModal } from './SmtpConfigModal'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { TextInput, Textarea } from '@/components/inputs'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'

type Props = {
  options: SendEmailOptions
  onOptionsChange: (options: SendEmailOptions) => void
}

export const SendEmailSettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCredentialsSelect = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId: credentialsId === undefined ? 'default' : credentialsId,
    })
  }

  const handleToChange = (recipientsStr: string) => {
    const recipients: string[] = recipientsStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      recipients,
    })
  }

  const handleCcChange = (ccStr: string) => {
    const cc: string[] = ccStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      cc,
    })
  }

  const handleBccChange = (bccStr: string) => {
    const bcc: string[] = bccStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      bcc,
    })
  }

  const handleSubjectChange = (subject: string) =>
    onOptionsChange({
      ...options,
      subject,
    })

  const handleBodyChange = (body: string) =>
    onOptionsChange({
      ...options,
      body,
    })

  const handleReplyToChange = (replyTo: string) =>
    onOptionsChange({
      ...options,
      replyTo,
    })

  const handleIsCustomBodyChange = (isCustomBody: boolean) =>
    onOptionsChange({
      ...options,
      isCustomBody,
    })

  const handleIsBodyCodeChange = () =>
    onOptionsChange({
      ...options,
      isBodyCode: options.isBodyCode ? !options.isBodyCode : true,
    })

  const handleChangeAttachmentVariable = (
    variable: Pick<Variable, 'id' | 'name'> | undefined
  ) =>
    onOptionsChange({
      ...options,
      attachmentsVariableId: variable?.id,
    })

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>From: </Text>
        {workspace && (
          <CredentialsDropdown
            type="smtp"
            workspaceId={workspace.id}
            currentCredentialsId={options.credentialsId}
            onCredentialsSelect={handleCredentialsSelect}
            onCreateNewClick={onOpen}
            defaultCredentialLabel={env('SMTP_FROM')
              ?.match(/<(.*)>/)
              ?.pop()}
          />
        )}
      </Stack>
      <TextInput
        label="Reply to:"
        onChange={handleReplyToChange}
        defaultValue={options.replyTo}
        placeholder={'email@gmail.com'}
      />
      <TextInput
        label="To:"
        onChange={handleToChange}
        defaultValue={options.recipients.join(', ')}
        placeholder="email1@gmail.com, email2@gmail.com"
      />
      <TextInput
        label="Cc:"
        onChange={handleCcChange}
        defaultValue={options.cc?.join(', ') ?? ''}
        placeholder="email1@gmail.com, email2@gmail.com"
      />
      <TextInput
        label="Bcc:"
        onChange={handleBccChange}
        defaultValue={options.bcc?.join(', ') ?? ''}
        placeholder="email1@gmail.com, email2@gmail.com"
      />
      <TextInput
        label="Subject:"
        onChange={handleSubjectChange}
        defaultValue={options.subject ?? ''}
      />
      <SwitchWithLabel
        label={'Custom content?'}
        moreInfoContent="By default, the email body will be a recap of what has been collected so far. You can override it with this option."
        initialValue={options.isCustomBody ?? false}
        onCheckChange={handleIsCustomBodyChange}
      />
      {options.isCustomBody && (
        <Stack>
          <Flex justifyContent="space-between">
            <Text>Content: </Text>
            <HStack>
              <Text fontSize="sm">Text</Text>
              <Switch
                size="sm"
                isChecked={options.isBodyCode ?? false}
                onChange={handleIsBodyCodeChange}
              />
              <Text fontSize="sm">Code</Text>
            </HStack>
          </Flex>
          {options.isBodyCode ? (
            <CodeEditor
              defaultValue={options.body ?? ''}
              onChange={handleBodyChange}
              lang="html"
            />
          ) : (
            <Textarea
              data-testid="body-input"
              minH="300px"
              onChange={handleBodyChange}
              defaultValue={options.body ?? ''}
            />
          )}
        </Stack>
      )}
      <Stack>
        <HStack>
          <FormLabel m="0" htmlFor="variable">
            Attach files:
          </FormLabel>
          <MoreInfoTooltip>
            The selected variable should have previously collected files from
            the File upload input block.
          </MoreInfoTooltip>
        </HStack>

        <VariableSearchInput
          initialVariableId={options.attachmentsVariableId}
          onSelectVariable={handleChangeAttachmentVariable}
        />
      </Stack>
      <SmtpConfigModal
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={handleCredentialsSelect}
      />
    </Stack>
  )
}
