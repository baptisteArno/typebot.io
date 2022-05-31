import { Stack, useDisclosure, Text } from '@chakra-ui/react'
import { CredentialsDropdown } from 'components/shared/CredentialsDropdown'
import { Input, Textarea } from 'components/shared/Textbox'
import { CredentialsType, SendEmailOptions } from 'models'
import React, { useState } from 'react'
import { SmtpConfigModal } from './SmtpConfigModal'

type Props = {
  options: SendEmailOptions
  onOptionsChange: (options: SendEmailOptions) => void
}

export const SendEmailSettings = ({ options, onOptionsChange }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [refreshCredentialsKey, setRefreshCredentialsKey] = useState(0)

  const handleCredentialsSelect = (credentialsId?: string) => {
    setRefreshCredentialsKey(refreshCredentialsKey + 1)
    onOptionsChange({
      ...options,
      credentialsId: credentialsId === undefined ? 'default' : credentialsId,
    })
  }

  const handleToChange = (recipientsStr: string) => {
    const recipients: string[] = recipientsStr
      .split(',')
      .map((str) => str.trim())
    onOptionsChange({
      ...options,
      recipients,
    })
  }

  const handleCcChange = (ccStr: string) => {
    const cc: string[] = ccStr.split(',').map((str) => str.trim())
    onOptionsChange({
      ...options,
      cc,
    })
  }

  const handleBccChange = (bccStr: string) => {
    const bcc: string[] = bccStr.split(',').map((str) => str.trim())
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

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>From: </Text>
        <CredentialsDropdown
          type={CredentialsType.SMTP}
          currentCredentialsId={options.credentialsId}
          onCredentialsSelect={handleCredentialsSelect}
          onCreateNewClick={onOpen}
          defaultCredentialLabel={process.env.NEXT_PUBLIC_SMTP_FROM?.match(
            /\<(.*)\>/
          )?.pop()}
          refreshDropdownKey={refreshCredentialsKey}
        />
      </Stack>
      <Stack>
        <Text>Reply to: </Text>
        <Input
          onChange={handleReplyToChange}
          defaultValue={options.replyTo}
          placeholder={'email@gmail.com'}
        />
      </Stack>
      <Stack>
        <Text>To: </Text>
        <Input
          onChange={handleToChange}
          defaultValue={options.recipients.join(', ')}
          placeholder="email1@gmail.com, email2@gmail.com"
        />
      </Stack>
      <Stack>
        <Text>Cc: </Text>
        <Input
          onChange={handleCcChange}
          defaultValue={options.cc?.join(', ') ?? ''}
          placeholder="email1@gmail.com, email2@gmail.com"
        />
      </Stack>
      <Stack>
        <Text>Bcc: </Text>
        <Input
          onChange={handleBccChange}
          defaultValue={options.bcc?.join(', ') ?? ''}
          placeholder="email1@gmail.com, email2@gmail.com"
        />
      </Stack>
      <Stack>
        <Text>Subject: </Text>
        <Input
          data-testid="subject-input"
          onChange={handleSubjectChange}
          defaultValue={options.subject ?? ''}
        />
      </Stack>
      <Stack>
        <Text>Body: </Text>
        <Textarea
          data-testid="body-input"
          minH="300px"
          onChange={handleBodyChange}
          defaultValue={options.body ?? ''}
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
