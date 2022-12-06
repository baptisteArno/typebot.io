import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export type Props = {
  mask?: string;
  label?: string;
  error?: string | null;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;