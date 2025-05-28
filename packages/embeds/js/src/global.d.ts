declare module "*.css";

declare module "solid-textarea-autosize" {
  import type { JSX } from "solid-js";

  const TextareaAutosize: (
    props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
      // rows?: number;
      minRows?: number;
      maxRows?: number;
    },
  ) => JSX.Element;

  export default TextareaAutosize;
}
