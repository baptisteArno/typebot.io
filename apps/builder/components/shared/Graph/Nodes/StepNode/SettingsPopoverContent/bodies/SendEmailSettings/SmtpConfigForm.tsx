import { FormControl, FormLabel, HStack, Stack } from '@chakra-ui/react'
import { isDefined } from '@udecode/plate-common'
import { SmartNumberInput } from 'components/shared/SmartNumberInput'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { SmtpCredentialsData } from 'models'
import React from 'react'

type Props = {
  config: SmtpCredentialsData
  onConfigChange: (config: SmtpCredentialsData) => void
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
      <FormControl isRequired>
        <FormLabel>From email:</FormLabel>
        <Input
          defaultValue={config.from.email ?? ''}
          onChange={handleFromEmailChange}
          placeholder="notifications@provider.com"
          withVariableButton={false}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>From name:</FormLabel>
        <Input
          defaultValue={config.from.name ?? ''}
          onChange={handleFromNameChange}
          placeholder="John Smith"
          withVariableButton={false}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Host:</FormLabel>
        <Input
          defaultValue={config.host ?? ''}
          onChange={handleHostChange}
          placeholder="mail.provider.com"
          withVariableButton={false}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Username / Email:</FormLabel>
        <Input
          type="email"
          defaultValue={config.username ?? ''}
          onChange={handleUsernameChange}
          placeholder="user@provider.com"
          withVariableButton={false}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password:</FormLabel>
        <Input
          type="password"
          defaultValue={config.password ?? ''}
          onChange={handlePasswordChange}
          withVariableButton={false}
        />
      </FormControl>
      <SwitchWithLabel
        id="Tls"
        label={'Use TLS?'}
        initialValue={config.isTlsEnabled ?? false}
        onCheckChange={handleTlsCheck}
      />
      <FormControl as={HStack} justifyContent="space-between">
        <FormLabel mb="0">Port number:</FormLabel>
        <SmartNumberInput
          placeholder="25"
          value={config.port}
          onValueChange={handlePortNumberChange}
        />
      </FormControl>
    </Stack>
  )
}
