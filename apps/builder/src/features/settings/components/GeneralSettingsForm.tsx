import {
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  FormHelperText,
} from '@chakra-ui/react'
import { TextInput } from '@/components/inputs/TextInput'
import { Textarea } from '@/components/inputs/Textarea'
import { Settings } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { DropdownList } from '@/components/DropdownList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import {
  defaultSettings,
  rememberUserStorages,
} from '@typebot.io/schemas/features/typebot/settings/constants'

type Props = {
  generalSettings: Settings['general'] | undefined
  tenant?: string | null
  toolDescription?: string | null
  onGeneralSettingsChange: (generalSettings: Settings['general']) => void
  onTenantChange: (tenant: string) => void
  onToolDescriptionChange: (toolDescription: string) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  tenant,
  toolDescription,
  onGeneralSettingsChange,
  onTenantChange,
  onToolDescriptionChange,
}: Props) => {
  const keyBg = useColorModeValue(undefined, 'gray.600')
  const toggleRememberUser = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        isEnabled,
      },
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })

  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    })

  const updateRememberUserStorage = (
    storage: NonNullable<
      NonNullable<Settings['general']>['rememberUser']
    >['storage']
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        storage,
      },
    })

  return (
    <Stack spacing={6}>
      {generalSettings?.type === 'TOOL' && (
        <>
          <TextInput
            label="Tenant"
            defaultValue={tenant ?? ''}
            onChange={onTenantChange}
            helperText="Identificador do tenant dentro do workspace."
          />
          <FormControl>
            <FormLabel>Tool description</FormLabel>
            <Alert status="info" mb={2} borderRadius="md">
              <AlertIcon />
              Extremamente importante: essa descrição será usada pelo nosso
              agente para decidir qual tool utilizar durante o reasoning loop.
            </Alert>
            <Textarea
              defaultValue={toolDescription ?? ''}
              onChange={onToolDescriptionChange}
              placeholder="Ex: 'Busca pedidos por CPF via API X e retorna status e detalhes do pedido'"
              minH="100px"
            />
            <FormHelperText>Descrição do objetivo da tool.</FormHelperText>
          </FormControl>
        </>
      )}
      <SwitchWithLabel
        label="Prefill input"
        initialValue={
          generalSettings?.isInputPrefillEnabled ??
          defaultSettings.general.isInputPrefillEnabled
        }
        onCheckChange={handleInputPrefillChange}
        moreInfoContent="Inputs are automatically pre-filled whenever their associated variable has a value"
      />
      <SwitchWithLabel
        label="Hide query params on bot start"
        initialValue={
          generalSettings?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled
        }
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent="If your URL contains query params, they will be automatically hidden when the bot starts."
      />
      <SwitchWithRelatedSettings
        label={'Remember user'}
        moreInfoContent="If enabled, the chat state will be restored if the user comes back after exiting."
        initialValue={
          generalSettings?.rememberUser?.isEnabled ??
          (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
            ? !generalSettings?.isNewResultOnRefreshEnabled
            : false)
        }
        onCheckChange={toggleRememberUser}
      >
        <FormControl as={HStack} justifyContent="space-between">
          <FormLabel mb="0">
            Storage:&nbsp;
            <MoreInfoTooltip>
              <Stack>
                <Text>
                  Choose{' '}
                  <Tag size="sm" bgColor={keyBg}>
                    session
                  </Tag>{' '}
                  to remember the user as long as he does not closes the tab or
                  the browser.
                </Text>
                <Text>
                  Choose{' '}
                  <Tag size="sm" bgColor={keyBg}>
                    local
                  </Tag>{' '}
                  to remember the user forever on the same device.
                </Text>
              </Stack>
            </MoreInfoTooltip>
          </FormLabel>
          <DropdownList
            currentItem={generalSettings?.rememberUser?.storage ?? 'session'}
            onItemSelect={updateRememberUserStorage}
            items={rememberUserStorages}
          ></DropdownList>
        </FormControl>
      </SwitchWithRelatedSettings>
    </Stack>
  )
}
