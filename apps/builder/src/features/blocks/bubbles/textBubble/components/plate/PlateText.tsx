import { useTypebot } from '@/features/editor/providers/TypebotProvider'

export const PlateText = ({
  text,
  bold,
  italic,
  underline,
}: {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}) => {
  let className = ''
  if (bold) className += 'slate-bold'
  if (italic) className += ' slate-italic'
  if (underline) className += ' slate-underline'
  if (className)
    return (
      <span className={className}>
        <PlateTextContent text={text} />
      </span>
    )
  return <PlateTextContent text={text} />
}

const PlateTextContent = ({ text }: { text: string }) => {
  const { typebot } = useTypebot()

  return (
    <>
      {text.split(/\{\{=(.*?=\}\})/g).map((str, idx) => {
        if (str.endsWith('=}}')) {
          return (
            <span className="slate-inline-code" key={idx}>
              {str.trim().slice(0, -3)}
            </span>
          )
        }
        return str.split(/\{\{(.*?\}\})/g).map((str, idx) => {
          if (str.endsWith('}}')) {
            const variableName = str.trim().slice(0, -2)
            const matchingVariable = typebot?.variables.find(
              (variable) => variable.name === variableName
            )
            if (!matchingVariable) return '{{' + str
            return (
              <span className="slate-variable" key={idx}>
                {str.trim().slice(0, -2)}
              </span>
            )
          }
          return str
        })
      })}
    </>
  )
}
