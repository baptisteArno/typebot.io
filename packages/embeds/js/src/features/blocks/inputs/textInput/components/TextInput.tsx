import { Textarea, ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { Answer, BotContext, InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@typebot.io/schemas'
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'
import clsx from 'clsx'
import { TextInputAddFileButton } from '@/components/TextInputAddFileButton'
import { SelectedFile } from '../../fileUpload/components/SelectedFile'
import { sanitizeNewFile } from '../../fileUpload/helpers/sanitizeSelectedFiles'
import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'
import { toaster } from '@/utils/toaster'
import { isDefined } from '@typebot.io/lib'
import { uploadFiles } from '../../fileUpload/helpers/uploadFiles'
import { guessApiHost } from '@/utils/guessApiHost'

type Props = {
  block: TextInputBlock
  defaultValue?: string
  context: BotContext
  onSubmit: (value: InputSubmitContent) => void
}

export const TextInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([])
  const [uploadProgress, setUploadProgress] = createSignal<
    { fileIndex: number; progress: number } | undefined
  >(undefined)
  const [isDraggingOver, setIsDraggingOver] = createSignal(false)
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  const handleInput = (inputValue: string) => setInputValue(inputValue)

  const checkIfInputIsValid = () =>
    inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = async () => {
    if (checkIfInputIsValid()) {
      let attachments: Answer['attachments']
      if (selectedFiles().length > 0) {
        setUploadProgress(undefined)
        const urls = await uploadFiles({
          apiHost:
            props.context.apiHost ?? guessApiHost({ ignoreChatApiUrl: true }),
          files: selectedFiles().map((file) => ({
            file: file,
            input: {
              sessionId: props.context.sessionId,
              fileName: file.name,
            },
          })),
          onUploadProgress: setUploadProgress,
        })
        attachments = urls?.filter(isDefined)
      }
      props.onSubmit({
        value: inputRef?.value ?? inputValue(),
        attachments,
      })
    } else inputRef?.focus()
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block.options?.isLong) return
    if (e.key === 'Enter') submit()
  }

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block.options?.isLong) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }

  onMount(() => {
    if (!isMobile() && inputRef)
      inputRef.focus({
        preventScroll: true,
      })
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'setInputValue') setInputValue(data.value)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => setIsDraggingOver(false)

  const handleDropFile = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer?.files) return
    onNewFiles(e.dataTransfer.files)
  }

  const onNewFiles = (files: FileList) => {
    const newFiles = Array.from(files)
      .map((file) =>
        sanitizeNewFile({
          existingFiles: selectedFiles(),
          newFile: file,
          params: {
            sizeLimit: getRuntimeVariable(
              'NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE'
            ),
          },
          onError: ({ description, title }) => {
            toaster.create({
              description,
              title,
            })
          },
        })
      )
      .filter(isDefined)

    if (newFiles.length === 0) return

    setSelectedFiles((selectedFiles) => [...newFiles, ...selectedFiles])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((selectedFiles) =>
      selectedFiles.filter((_, i) => i !== index)
    )
  }

  return (
    <div
      class={clsx(
        'typebot-input-form flex w-full gap-2 items-end',
        props.block.options?.isLong ? 'max-w-full' : 'max-w-[350px]'
      )}
      onKeyDown={submitWhenEnter}
      onDrop={handleDropFile}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        class={clsx(
          'typebot-input flex-col w-full',
          isDraggingOver() && 'filter brightness-95'
        )}
      >
        <Show when={selectedFiles().length}>
          <div
            class="p-2 flex gap-2 border-gray-100 overflow-auto"
            style={{ 'border-bottom-width': '1px' }}
          >
            <For each={selectedFiles()}>
              {(file, index) => (
                <SelectedFile
                  file={file}
                  uploadProgressPercent={
                    uploadProgress()
                      ? uploadProgress()?.fileIndex === index()
                        ? 20
                        : index() < (uploadProgress()?.fileIndex ?? 0)
                        ? 100
                        : 0
                      : undefined
                  }
                  onRemoveClick={() => removeSelectedFile(index())}
                />
              )}
            </For>
          </div>
        </Show>
        <div
          class={clsx(
            'flex justify-between px-2',
            props.block.options?.isLong ? 'items-end' : 'items-center'
          )}
        >
          {props.block.options?.isLong ? (
            <Textarea
              ref={inputRef as HTMLTextAreaElement}
              onInput={handleInput}
              onKeyDown={submitIfCtrlEnter}
              value={inputValue()}
              placeholder={
                props.block.options?.labels?.placeholder ??
                defaultTextInputOptions.labels.placeholder
              }
            />
          ) : (
            <ShortTextInput
              ref={inputRef as HTMLInputElement}
              onInput={handleInput}
              value={inputValue()}
              placeholder={
                props.block.options?.labels?.placeholder ??
                defaultTextInputOptions.labels.placeholder
              }
            />
          )}
          <Show
            when={
              (props.block.options?.attachments?.isEnabled ??
                defaultTextInputOptions.attachments.isEnabled) &&
              props.block.options?.attachments?.saveVariableId
            }
          >
            <TextInputAddFileButton
              onNewFiles={onNewFiles}
              class={clsx(props.block.options?.isLong ? 'ml-2' : undefined)}
            />
          </Show>
        </div>
      </div>

      <SendButton
        type="button"
        on:click={submit}
        isDisabled={Boolean(uploadProgress())}
        class="h-[56px]"
      >
        {props.block.options?.labels?.button}
      </SendButton>
    </div>
  )
}
