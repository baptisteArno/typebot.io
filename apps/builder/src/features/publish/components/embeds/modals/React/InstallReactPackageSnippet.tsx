import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallReactPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @flowdacity/js @flowdacity/react`}
      isReadOnly
      lang="shell"
    />
  )
}
