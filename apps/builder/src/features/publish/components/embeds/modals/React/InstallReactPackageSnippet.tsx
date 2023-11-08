import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallReactPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @typebot.io/js @typebot.io/react`}
      isReadOnly
      lang="shell"
    />
  )
}
