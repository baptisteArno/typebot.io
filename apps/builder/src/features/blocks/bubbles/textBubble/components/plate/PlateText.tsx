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

const PlateTextContent = ({ text }: { text: string }) => (
  <>
    {text.split(/\{\{(.*?\}\})/g).map((str, idx) => {
      if (str.endsWith('}}')) {
        return (
          <span className="slate-variable" key={idx}>
            {str.trim().slice(0, -2)}
          </span>
        )
      }
      return str
    })}
  </>
)
