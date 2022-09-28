import { DetailedHTMLProps, InputHTMLAttributes, ChangeEvent } from 'react'

export type OctaSelectProps = {
  items: Array<SelectItems<OptionItemType>>
  onChange: (e: OptionItemType) => void
  defaultSelected?: OptionItemType
} & DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

type SelectItems<T> = T

export type OptionItemType = {
  label: string
  value: any
  isTitle?: boolean
  disabled?: boolean
}
