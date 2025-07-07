import { FileIcon } from '@/components/icons/FileIcon'
import clsx from 'clsx'

type Props = {
  file: { name: string }
}

export const FilePreview = (props: Props) => {
  const fileColor = getFileAssociatedColor(props.file)

  return (
    <div
      class={
        'flex items-center gap-4 border bg-white border-gray-200 rounded-md p-2 text-gray-900 min-w-[250px]'
      }
    >
      <div
        class={clsx(
          'rounded-md text-white p-2 flex items-center',
          fileColor === 'pink' && 'bg-pink-400',
          fileColor === 'orange' && 'bg-orange-400',
          fileColor === 'green' && 'bg-green-400',
          fileColor === 'gray' && 'bg-gray-400',
          fileColor === 'orange' && 'bg-orange-400'
        )}
      >
        <FileIcon class="w-6 h-6" />
      </div>
      <div class="flex flex-col">
        <span class="text-md font-semibold text-sm">{props.file.name}</span>
        <span class="text-gray-500 text-xs">
          {formatFileExtensionHumanReadable(props.file)}
        </span>
      </div>
    </div>
  )
}

const formatFileExtensionHumanReadable = (file: { name: string }) => {
  const extension = file.name.split('.').pop()
  switch (extension) {
    case 'pdf':
      return 'PDF'
    case 'doc':
    case 'docx':
      return 'Word'
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'Sheet'
    case 'json':
      return 'JSON'
    case 'md':
      return 'Markdown'
    default:
      return 'DOCUMENT'
  }
}

const getFileAssociatedColor = (file: {
  name: string
}): 'pink' | 'blue' | 'green' | 'gray' | 'orange' => {
  const extension = file.name.split('.').pop()
  if (!extension) return 'gray'
  switch (extension) {
    case 'pdf':
      return 'pink'
    case 'doc':
    case 'docx':
      return 'blue'
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'green'
    case 'json':
      return 'orange'
    default:
      return 'gray'
  }
}
