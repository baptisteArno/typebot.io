import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import { SELECT_ACTION, SELECT_ACTIONS } from './OctaSelect';

export type OctaSelectProps = {
  onChange: (value: any, itemFull?: any) => void
  defaultSelected?: any
  label?: string;
  findable?: boolean;
  options?: Array<OptionType>;
  showEdit?: boolean;
  showDelete?: boolean;
  onIconClicked?: (value: any, action: SELECT_ACTION) => {}
} & DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>

export type OptionProps = {
  value: any;
  children?: string;
  optionKey?: string | number;
  isTitle?: boolean;
  disabled?: boolean;
  selected: any;
  showEdit?: boolean;
  showDelete?: boolean;
  onIconClicked?: (value: any, action: SELECT_ACTION) => {}
} & DetailedHTMLProps<InputHTMLAttributes<HTMLLIElement>, HTMLLIElement>

export type OptionType = {
  value: any;
  label: string;
  isTitle?: boolean;
  disabled?: boolean;
  key: string | number;
  optionKey?: string | number;
  subType?: string;
}
