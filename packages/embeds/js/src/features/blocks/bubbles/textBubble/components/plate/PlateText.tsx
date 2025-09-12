import type { TText } from "@typebot.io/rich-text/plate";

const computeClassNames = (
  bold: unknown,
  italic: unknown,
  underline: unknown,
) => {
  let className = "";
  if (bold) className += "slate-bold";
  if (italic) className += " slate-italic";
  if (underline) className += " slate-underline";
  return className;
};

export const PlateText = (props: TText) => (
  <span class={computeClassNames(props.bold, props.italic, props.underline)}>
    {props.text}
  </span>
);
