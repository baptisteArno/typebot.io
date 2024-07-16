import { TextInput, NumberInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Stack } from '@chakra-ui/react'
import { isDefined } from '@udecode/plate-common'
import { SmtpCredentials } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  config: SmtpCredentials['data'] | undefined
  onConfigChange: (config: SmtpCredentials['data']) => void
}

export const SmtpConfigForm = ({ config, onConfigChange }: Props) => {
  const handleFromEmailChange = (email: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, email } })

  const handleFromNameChange = (name: string) =>
    config && onConfigChange({ ...config, from: { ...config.from, name } })

  const handleHostChange = (host: string) =>
    config && onConfigChange({ ...config, host })

  const handleUsernameChange = (username: string) =>
    config && onConfigChange({ ...config, username })

  const handlePasswordChange = (password: string) =>
    config && onConfigChange({ ...config, password })

  const handleTlsCheck = (isTlsEnabled: boolean) =>
    config && onConfigChange({ ...config, isTlsEnabled })

  const handlePortNumberChange = (port?: number) =>
    config && isDefined(port) && onConfigChange({ ...config, port })

  return (
    <Stack spacing={4}>
      <TextInput
        isRequired
        label="From email"
        defaultValue={config?.from.email}
        onChange={handleFromEmailChange}
        placeholder="notifications@provider.com"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        label="From name"
        defaultValue={config?.from.name}
        onChange={handleFromNameChange}
        placeholder="John Smith"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Host"
        defaultValue={config?.host}
        onChange={handleHostChange}
        placeholder="mail.provider.com"
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Username"
        type="email"
        defaultValue={config?.username}
        onChange={handleUsernameChange}
        withVariableButton={false}
        isDisabled={!config}
      />
      <TextInput
        isRequired
        label="Password"
        type="password"
        defaultValue={config?.password}
        onChange={handlePasswordChange}
        withVariableButton={false}
        isDisabled={!config}
      />
      <SwitchWithLabel
        label="Secure?"
        initialValue={config?.isTlsEnabled}
        onCheckChange={handleTlsCheck}
        moreInfoContent="If enabled, the connection will use TLS when connecting to server. If disabled then TLS is used if server supports the STARTTLS extension. In most cases enable it if you are connecting to port 465. For port 587 or 25 keep it disabled."
        isDisabled={!config}
      />
      <NumberInput
        isRequired
        label="Port number:"
        placeholder="25"
        defaultValue={config?.port}
        onValueChange={handlePortNumberChange}
        withVariableButton={false}
        isDisabled={!config}
      />
    </Stack>
  )
}
