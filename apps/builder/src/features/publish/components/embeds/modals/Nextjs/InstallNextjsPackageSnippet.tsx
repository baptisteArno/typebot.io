import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallNextjsPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @sniper.io/js @sniper.io/nextjs`}
      isReadOnly
      lang="shell"
    />
  )
}
