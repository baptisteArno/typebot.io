import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { BeforeMaskedStateChangeStates, InputState } from "react-input-mask";

export type Props = {
  mask?: string | Array<(string | RegExp)>;
  label?: string;
  error?: string | null;
  beforeMaskedStateChange?: (states: BeforeMaskedStateChangeStates) => InputState;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;