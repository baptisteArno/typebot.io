import { FileInputBlock } from './schema'

export const defaultFileInputOptions = {
  isRequired: true,
  isMultipleAllowed: false,
  labels: {
    placeholder: `<strong>
      Click to upload
    </strong> or drag and drop<br>
    (size limit: 10MB)`,
    button: 'Upload',
    clear: 'Clear',
    skip: 'Skip',
  },
} as const satisfies FileInputBlock['options']
