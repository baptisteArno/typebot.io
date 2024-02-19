import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallNextjsPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @flowdacity/js @flowdacity/nextjs`}
      isReadOnly
      lang="shell"
    />
  )
}
