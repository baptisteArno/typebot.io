import { CodeEditor } from '@/components/CodeEditor'

export const InstallReactPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @typebot.io/js @typebot.io/react`}
      isReadOnly
      lang="shell"
    />
  )
}
