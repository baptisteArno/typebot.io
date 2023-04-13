import { Show } from 'solid-js'

export type PlateTextProps = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

const computeClassNames = (
  bold: boolean | undefined,
  italic: boolean | undefined,
  underline: boolean | undefined
) => {
  let className = ''
  if (bold) className += 'slate-bold'
  if (italic) className += ' slate-italic'
  if (underline) className += ' slate-underline'
  return className
}

export const PlateText = (props: PlateTextProps) => (
  <Show
    when={computeClassNames(props.bold, props.italic, props.underline)}
    keyed
    fallback={<>{props.text}</>}
  >
    {(className) => <span class={className}>{props.text}</span>}
  </Show>
)
