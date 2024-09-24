import { isEmpty } from "@typebot.io/lib/utils";
import { Show } from "solid-js";

export type PlateTextProps = {
  text: string;
  isUniqueChild: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const computeClassNames = (
  bold: boolean | undefined,
  italic: boolean | undefined,
  underline: boolean | undefined,
) => {
  let className = "";
  if (bold) className += "slate-bold";
  if (italic) className += " slate-italic";
  if (underline) className += " slate-underline";
  return className;
};

export const PlateText = (props: PlateTextProps) => (
  <span class={computeClassNames(props.bold, props.italic, props.underline)}>
    {props.text}
    <Show when={props.isUniqueChild && isEmpty(props.text)}>
      <br />
    </Show>
  </span>
);
