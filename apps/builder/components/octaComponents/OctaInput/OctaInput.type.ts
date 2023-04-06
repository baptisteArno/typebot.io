import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { BeforeMaskedStateChangeStates, InputState } from "react-input-mask";

export type Props = {
  mask?: string | Array<(string | RegExp)>;
  formatChars?: any;
  maskChar?: string | null;
  label?: string;
  error?: string | null;
  beforeMaskedStateChange?: (states: BeforeMaskedStateChangeStates) => InputState;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
