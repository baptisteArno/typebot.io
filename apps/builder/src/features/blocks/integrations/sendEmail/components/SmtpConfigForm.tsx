import { TextInput, NumberInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Stack } from '@chakra-ui/react'
import { isDefined } from '@udecode/plate-common'
import { SmtpCredentials } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  config: SmtpCredentials['data']
  onConfigChange: (config: SmtpCredentials['data']) => void
}

export const SmtpConfigForm = ({ config, onConfigChange }: Props) => {
  const handleFromEmailChange = (email: string) =>
    onConfigChange({ ...config, from: { ...config.from, email } })
  const handleFromNameChange = (name: string) =>
    onConfigChange({ ...config, from: { ...config.from, name } })
  const handleHostChange = (host: string) => onConfigChange({ ...config, host })
  const handleUsernameChange = (username: string) =>
    onConfigChange({ ...config, username })
  const handlePasswordChange = (password: string) =>
    onConfigChange({ ...config, password })
  const handleTlsCheck = (isTlsEnabled: boolean) =>
    onConfigChange({ ...config, isTlsEnabled })
  const handlePortNumberChange = (port?: number) =>
    isDefined(port) && onConfigChange({ ...config, port })

  return (
    <Stack as="form" spacing={4}>
      <TextInput
        isRequired
        label="From email"
        defaultValue={config.from.email ?? ''}
        onChange={handleFromEmailChange}
        placeholder="notifications@provider.com"
        withVariableButton={false}
      />
      <TextInput
        label="From name"
        defaultValue={config.from.name ?? ''}
        onChange={handleFromNameChange}
        placeholder="John Smith"
        withVariableButton={false}
      />
      <TextInput
        isRequired
        label="Host"
        defaultValue={config.host ?? ''}
        onChange={handleHostChange}
        placeholder="mail.provider.com"
        withVariableButton={false}
      />
      <TextInput
        isRequired
        label="Username / Email"
        type="email"
        defaultValue={config.username ?? ''}
        onChange={handleUsernameChange}
        placeholder="user@provider.com"
        withVariableButton={false}
      />
      <TextInput
        isRequired
        label="Password"
        type="password"
        defaultValue={config.password ?? ''}
        onChange={handlePasswordChange}
        withVariableButton={false}
      />
      <SwitchWithLabel
        label="Secure?"
        initialValue={config.isTlsEnabled ?? false}
        onCheckChange={handleTlsCheck}
        moreInfoContent="If enabled, the connection will use TLS when connecting to server. If disabled then TLS is used if server supports the STARTTLS extension. In most cases enable it if you are connecting to port 465. For port 587 or 25 keep it disabled."
      />
      <NumberInput
        isRequired
        label="Port number:"
        placeholder="25"
        defaultValue={config.port}
        onValueChange={handlePortNumberChange}
        withVariableButton={false}
      />
    </Stack>
  )
}
