import { useTranslate } from '@tolgee/react'
import { ChoiceInputBlock } from '@typebot.io/schemas'
import {
  defaultChoiceInputOptions,
  headerType,
  interactiveButtonType,
  interactiveListHeaderTypes,
  interactiveReplyHeaderTypes,
} from '@typebot.io/schemas/features/blocks/inputs/choice/constants'
import { DropdownList } from '../../../../../components/DropdownList'
import { Textarea, TextInput } from '../../../../../components/inputs'
import { useState } from 'react'

type Props = {
  options?: ChoiceInputBlock['options']
  onOptionsChange: (options: ChoiceInputBlock['options']) => void
}

export const ButtonsBlockInteractiveSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()
  const [headerError, setHeaderError] = useState<string>('')
  const [bodyError, setBodyError] = useState<string>('')

  const validateHeader = (value: string) => {
    if (options?.interactiveData?.headerType === headerType.TEXT) {
      if (!value.trim()) {
        setHeaderError(t('blocks.inputs.settings.interactive.error.required'))
      } else {
        setHeaderError('')
      }
    } else {
      try {
        new URL(value)
        setHeaderError('')
      } catch {
        setHeaderError(t('blocks.inputs.settings.interactive.error.invalid'))
      }
    }
  }

  const validateBody = (value: string) => {
    if (!value.trim()) {
      setBodyError(t('blocks.inputs.settings.interactive.error.required'))
    } else {
      setBodyError('')
    }
  }

  const updateInteractiveHeaderType = (headerType?: headerType) => {
    onOptionsChange({
      ...options,
      interactiveData: { ...options?.interactiveData, headerType },
    })
  }
  const updateInteractiveHeader = (header?: string) =>
    onOptionsChange({
      ...options,
      interactiveData: { ...options?.interactiveData, header },
    })
  const updateInteractiveBody = (body?: string) =>
    onOptionsChange({
      ...options,
      interactiveData: { ...options?.interactiveData, body },
    })
  const updateInteractiveFooter = (footer?: string) => {
    if (footer && footer?.length > 60) return
    onOptionsChange({
      ...options,
      interactiveData: { ...options?.interactiveData, footer },
    })
  }
  const updateInteractiveMenuTitle = (menuTitle?: string) =>
    onOptionsChange({
      ...options,
      interactiveData: { ...options?.interactiveData, menuTitle },
    })

  const getDropdownListItems = (buttonType: interactiveButtonType) => {
    const headerTypes =
      buttonType === interactiveButtonType.REPLY
        ? interactiveReplyHeaderTypes
        : interactiveListHeaderTypes

    return headerTypes.map((type: headerType) => ({
      value: type,
      label: t('blocks.inputs.settings.interactive.headerType.' + type),
    }))
  }

  return (
    <>
      {options?.interactiveButtonType === interactiveButtonType.LIST && (
        <TextInput
          label={t('blocks.inputs.settings.interactive.menuTitle.label')}
          placeholder={t(
            'blocks.inputs.settings.interactive.menuTitle.placeholder'
          )}
          helperText={t(
            'blocks.inputs.settings.interactive.menuTitle.helperText'
          )}
          defaultValue={options?.interactiveData?.menuTitle || ''}
          onChange={updateInteractiveMenuTitle}
        />
      )}
      <DropdownList
        label={t('blocks.inputs.settings.interactive.headerType.label')}
        placeholder={t(
          'blocks.inputs.settings.interactive.headerType.placeholder'
        )}
        currentItem={options?.interactiveData?.headerType || headerType.NONE}
        onItemSelect={(_, item) =>
          item && updateInteractiveHeaderType(item.value)
        }
        items={getDropdownListItems(
          options?.interactiveButtonType ||
            defaultChoiceInputOptions.interactiveButtonType
        )}
      />
      {options?.interactiveData?.headerType &&
        options?.interactiveData?.headerType !== headerType.NONE && (
          <TextInput
            label={t('blocks.inputs.settings.interactive.header.label')}
            placeholder={t(
              'blocks.inputs.settings.interactive.header.placeholder'
            )}
            defaultValue={options?.interactiveData?.header || ''}
            type={
              options?.interactiveData?.headerType === headerType.TEXT
                ? 'text'
                : 'url'
            }
            onChange={(value) => {
              updateInteractiveHeader(value)
              validateHeader(value)
            }}
            helperText={
              headerError +
              t(
                `blocks.inputs.settings.interactive.header.helperText.${
                  options?.interactiveData?.headerType === headerType.TEXT
                    ? 'text'
                    : 'url'
                }`
              )
            }
          />
        )}
      <Textarea
        label={t('blocks.inputs.settings.interactive.body.label')}
        placeholder={t('blocks.inputs.settings.interactive.body.placeholder')}
        defaultValue={options?.interactiveData?.body || ''}
        onChange={(value) => {
          updateInteractiveBody(value)
          validateBody(value)
        }}
        helperText={
          bodyError + t('blocks.inputs.settings.interactive.body.helperText')
        }
      />
      <TextInput
        label={t('blocks.inputs.settings.interactive.footer.label')}
        placeholder={t('blocks.inputs.settings.interactive.footer.placeholder')}
        defaultValue={options?.interactiveData?.footer || ''}
        onChange={updateInteractiveFooter}
        helperText={t('blocks.inputs.settings.interactive.footer.helperText')}
      />
    </>
  )
}
