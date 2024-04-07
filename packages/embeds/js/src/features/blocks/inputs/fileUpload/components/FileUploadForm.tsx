import { SendButton } from '@/components/SendButton'
import { BotContext, InputSubmitContent } from '@/types'
import { FileInputBlock } from '@typebot.io/schemas'
import { createSignal, Match, Show, Switch } from 'solid-js'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { uploadFiles } from '../helpers/uploadFiles'
import { guessApiHost } from '@/utils/guessApiHost'
import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'
import { defaultFileInputOptions } from '@typebot.io/schemas/features/blocks/inputs/file/constants'
import { isDefined } from '@typebot.io/lib'

type Props = {
  context: BotContext
  block: FileInputBlock
  onSubmit: (url: InputSubmitContent) => void
  onSkip: (label: string) => void
}

export const FileUploadForm = (props: Props) => {
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([])
  const [isUploading, setIsUploading] = createSignal(false)
  const [uploadProgressPercent, setUploadProgressPercent] = createSignal(0)
  const [isDraggingOver, setIsDraggingOver] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal<string>()

  const onNewFiles = (files: FileList) => {
    setErrorMessage(undefined)
    const newFiles = Array.from(files)
    const sizeLimit =
      props.block.options && 'sizeLimit' in props.block.options
        ? props.block.options?.sizeLimit ??
          getRuntimeVariable('NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE')
        : undefined
    if (
      sizeLimit &&
      newFiles.some((file) => file.size > sizeLimit * 1024 * 1024)
    )
      return setErrorMessage(`A file is larger than ${sizeLimit}MB`)
    if (!props.block.options?.isMultipleAllowed && files)
      return startSingleFileUpload(newFiles[0])
    if (selectedFiles().length === 0) {
      setSelectedFiles(newFiles)
      return
    }
    const parsedNewFiles = newFiles.map((newFile) => {
      let fileName = newFile.name
      let counter = 1
      while (selectedFiles().some((file) => file.name === fileName)) {
        const dotIndex = newFile.name.lastIndexOf('.')
        const extension = dotIndex !== -1 ? newFile.name.slice(dotIndex) : ''
        fileName = `${newFile.name.slice(0, dotIndex)}(${counter})${extension}`
        counter++
      }
      return new File([newFile], fileName, { type: newFile.type })
    })
    setSelectedFiles([...selectedFiles(), ...parsedNewFiles])
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (selectedFiles().length === 0) return
    startFilesUpload(selectedFiles())
  }

  const startSingleFileUpload = async (file: File) => {
    if (props.context.isPreview || !props.context.resultId)
      return props.onSubmit({
        label:
          props.block.options?.labels?.success?.single ??
          defaultFileInputOptions.labels.success.single,
        value: 'http://fake-upload-url.com',
      })
    setIsUploading(true)
    const urls = await uploadFiles({
      apiHost:
        props.context.apiHost ?? guessApiHost({ ignoreChatApiUrl: true }),
      files: [
        {
          file,
          input: {
            sessionId: props.context.sessionId,
            fileName: file.name,
          },
        },
      ],
    })
    setIsUploading(false)
    if (urls.length)
      return props.onSubmit({
        label:
          props.block.options?.labels?.success?.single ??
          defaultFileInputOptions.labels.success.single,
        value: urls[0] ? encodeUrl(urls[0]) : '',
      })
    setErrorMessage('An error occured while uploading the file')
  }
  const startFilesUpload = async (files: File[]) => {
    const resultId = props.context.resultId
    if (props.context.isPreview || !resultId)
      return props.onSubmit({
        label:
          files.length > 1
            ? (
                props.block.options?.labels?.success?.multiple ??
                defaultFileInputOptions.labels.success.multiple
              ).replaceAll('{total}', files.length.toString())
            : props.block.options?.labels?.success?.single ??
              defaultFileInputOptions.labels.success.single,
        value: files
          .map((_, idx) => `http://fake-upload-url.com/${idx}`)
          .join(', '),
      })
    setIsUploading(true)
    const urls = await uploadFiles({
      apiHost:
        props.context.apiHost ?? guessApiHost({ ignoreChatApiUrl: true }),
      files: files.map((file) => ({
        file: file,
        input: {
          sessionId: props.context.sessionId,
          fileName: file.name,
        },
      })),
      onUploadProgress: setUploadProgressPercent,
    })
    setIsUploading(false)
    setUploadProgressPercent(0)
    if (urls.length !== files.length)
      return setErrorMessage('An error occured while uploading the files')
    props.onSubmit({
      label:
        urls.length > 1
          ? (
              props.block.options?.labels?.success?.multiple ??
              defaultFileInputOptions.labels.success.multiple
            ).replaceAll('{total}', urls.length.toString())
          : props.block.options?.labels?.success?.single ??
            defaultFileInputOptions.labels.success.single,
      value: urls.filter(isDefined).map(encodeUrl).join(', '),
    })
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

  const clearFiles = () => setSelectedFiles([])

  const skip = () =>
    props.onSkip(
      props.block.options?.labels?.skip ?? defaultFileInputOptions.labels.skip
    )

  return (
    <form class="flex flex-col w-full gap-2" onSubmit={handleSubmit}>
      <label
        for="dropzone-file"
        class={
          'typebot-upload-input py-6 flex flex-col justify-center items-center w-full bg-gray-50 border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100 px-8 ' +
          (isDraggingOver() ? 'dragging-over' : '')
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropFile}
      >
        <Switch>
          <Match when={isUploading()}>
            <Show when={selectedFiles().length > 1} fallback={<Spinner />}>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="upload-progress-bar h-2.5 rounded-full"
                  style={{
                    width: `${
                      uploadProgressPercent() > 0 ? uploadProgressPercent : 10
                    }%`,
                    transition: 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </Show>
          </Match>
          <Match when={!isUploading()}>
            <>
              <div class="flex flex-col justify-center items-center">
                <Show when={selectedFiles().length} fallback={<UploadIcon />}>
                  <span class="relative">
                    <FileIcon />
                    <div
                      class="total-files-indicator flex items-center justify-center absolute -right-1 rounded-full px-1 w-4 h-4"
                      style={{ bottom: '5px' }}
                    >
                      {selectedFiles().length}
                    </div>
                  </span>
                </Show>
                <p
                  class="text-sm text-gray-500 text-center"
                  innerHTML={
                    props.block.options?.labels?.placeholder ??
                    defaultFileInputOptions.labels.placeholder
                  }
                />
              </div>
              <input
                id="dropzone-file"
                type="file"
                class="hidden"
                multiple={
                  props.block.options?.isMultipleAllowed ??
                  defaultFileInputOptions.isMultipleAllowed
                }
                onChange={(e) => {
                  if (!e.currentTarget.files) return
                  onNewFiles(e.currentTarget.files)
                }}
              />
            </>
          </Match>
        </Switch>
      </label>
      <Show
        when={
          selectedFiles().length === 0 &&
          props.block.options?.isRequired === false
        }
      >
        <div class="flex justify-end">
          <Button on:click={skip}>
            {props.block.options?.labels?.skip ??
              defaultFileInputOptions.labels.skip}
          </Button>
        </div>
      </Show>
      <Show
        when={
          props.block.options?.isMultipleAllowed &&
          selectedFiles().length > 0 &&
          !isUploading()
        }
      >
        <div class="flex justify-end">
          <div class="flex gap-2">
            <Show when={selectedFiles().length}>
              <Button variant="secondary" on:click={clearFiles}>
                {props.block.options?.labels?.clear ??
                  defaultFileInputOptions.labels.clear}
              </Button>
            </Show>
            <SendButton type="submit" disableIcon>
              {(props.block.options?.labels?.button ??
                defaultFileInputOptions.labels.button) ===
              defaultFileInputOptions.labels.button
                ? `Upload ${selectedFiles().length} file${
                    selectedFiles().length > 1 ? 's' : ''
                  }`
                : props.block.options?.labels?.button}
            </SendButton>
          </div>
        </div>
      </Show>
      <Show when={errorMessage()}>
        <p class="text-red-500 text-sm">{errorMessage()}</p>
      </Show>
    </form>
  )
}

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="mb-3 text-gray-500"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
)

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="mb-3 text-gray-500"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

const encodeUrl = (url: string): string => {
  const fileName = url.split('/').pop()
  if (!fileName) return url
  const encodedFileName = encodeURIComponent(fileName)
  return url.replace(fileName, encodedFileName)
}
