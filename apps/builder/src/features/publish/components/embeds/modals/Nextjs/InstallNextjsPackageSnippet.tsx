import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallNextjsPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @typebot.io/js @typebot.io/nextjs`}
      isReadOnly
      lang="shell"
    />
  )
}
