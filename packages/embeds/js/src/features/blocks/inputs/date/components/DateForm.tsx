import { SendButton } from "@/components/SendButton";
import type { InputSubmitContent } from "@/types";
import { defaultDateInputOptions } from "@typebot.io/blocks-inputs/date/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import clsx from "clsx";
import { createSignal } from "solid-js";

type Props = {
  onSubmit: (inputValue: InputSubmitContent) => void;
  options?: DateInputBlock["options"];
  defaultValue?: string;
};

export const DateForm = (props: Props) => {
  const [inputValues, setInputValues] = createSignal(
    parseDefaultValue(props.defaultValue ?? ""),
  );

  const submit = () => {
    if (inputValues().from === "" && inputValues().to === "") return;
    props.onSubmit({
      type: "text",
      value: `${inputValues().from}${
        props.options?.isRange ? ` to ${inputValues().to}` : ""
      }`,
    });
  };

  return (
    <div class="typebot-input-form flex gap-2 items-end">
      <form
        class={clsx(
          "flex typebot-input",
          props.options?.isRange ? "items-end" : "items-center",
        )}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div class="flex flex-col">
          <div
            class={
              "flex items-center p-4 " +
              (props.options?.isRange ? "pb-0 gap-2" : "")
            }
          >
            {props.options?.isRange && (
              <p class="font-semibold">
                {props.options.labels?.from ??
                  defaultDateInputOptions.labels.from}
              </p>
            )}
            <input
              class="focus:outline-none flex-1 w-full text-input typebot-date-input"
              style={{
                "min-height": "32px",
                "min-width": "100px",
                "font-size": "16px",
              }}
              value={inputValues().from}
              type={props.options?.hasTime ? "datetime-local" : "date"}
              onChange={(e) =>
                setInputValues({
                  ...inputValues(),
                  from: e.currentTarget.value,
                })
              }
              min={props.options?.min}
              max={props.options?.max}
              data-testid="from-date"
            />
          </div>
          {props.options?.isRange && (
            <div class="flex items-center p-4">
              {props.options.isRange && (
                <p class="font-semibold">
                  {props.options.labels?.to ??
                    defaultDateInputOptions.labels.to}
                </p>
              )}
              <input
                class="focus:outline-none flex-1 w-full text-input ml-2 typebot-date-input"
                style={{
                  "min-height": "32px",
                  "min-width": "100px",
                  "font-size": "16px",
                }}
                value={inputValues().to}
                type={props.options.hasTime ? "datetime-local" : "date"}
                onChange={(e) =>
                  setInputValues({
                    ...inputValues(),
                    to: e.currentTarget.value,
                  })
                }
                min={props.options?.min}
                max={props.options?.max}
                data-testid="to-date"
              />
            </div>
          )}
        </div>
      </form>
      <SendButton class="h-[56px]" on:click={submit}>
        {props.options?.labels?.button}
      </SendButton>
    </div>
  );
};

const parseDefaultValue = (defaultValue: string) => {
  if (!defaultValue.includes("to")) return { from: defaultValue, to: "" };
  const [from, to] = defaultValue.split(" to ");
  return { from, to };
};
