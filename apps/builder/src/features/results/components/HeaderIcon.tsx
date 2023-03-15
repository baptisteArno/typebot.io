import { CodeIcon, CalendarIcon } from '@/components/icons'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { ResultHeaderCell } from '@typebot.io/schemas'

export const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableIds ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  )
