import { CodeEditor } from '@/components/inputs/CodeEditor'

export const InstallReactPackageSnippet = () => {
  return (
    <CodeEditor
      value={`npm install @sniper.io/js @sniper.io/react`}
      isReadOnly
      lang="shell"
    />
  )
}
