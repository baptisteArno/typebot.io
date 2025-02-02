import { SendButton } from "@/components/SendButton";
import { executeHttpRequest } from "@/features/blocks/integrations/httpRequest/executeHttpRequest";
import type { BotContext, InputSubmitContent } from "@/types";
import type { OtpInputBlock } from "@typebot.io/blocks-inputs/otp/schema";
import { HttpMethod } from "@typebot.io/blocks-integrations/httpRequest/constants";
import clsx from "clsx";
import { Match, Switch, createSignal, onMount } from "solid-js";
import { InputItem } from "./InputItem";

type Props = {
  block: OtpInputBlock;
  defaultValue?: string;
  context: BotContext;
  onSubmit: (value: InputSubmitContent) => void;
};

export const OtpInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? "");
  let submitRef: HTMLButtonElement | undefined;
  const inputs: any[] = [];
  const codeLength = props.block.options?.codeLength ?? 4;

  const appendToInputValue = (value: string) => {
    setInputValue(inputValue() + value);
  };

  const checkIfInputIsValid = () => {
    return inputValue() !== "";
  };

  onMount(async () => {
    console.log("onMount");
    await execute();
  });

  const execute = async () => {
    console.log("execute HTTP Request");
    JSON.stringify(props.block.options?.webhook);
    if (!props.block.options?.webhook) return;
    const webhook = props.block.options?.webhook;

    const response = await executeHttpRequest({
      url: webhook.url ?? "",
      method: webhook.method ?? HttpMethod.POST,
      headers: webhook.headers?.reduce(
        (acc, header) => {
          acc[header.key ?? ""] = header.value ?? "";
          return acc;
        },
        {} as Record<string, string>,
      ),
      body: webhook.body ?? "",
    });
    return { replyToSend: response };
  };

  const resendCode = async () => {
    await execute();
  };

  const submit = async () => {
    if (checkIfInputIsValid()) {
      props.onSubmit({
        type: "text",
        value: inputValue(),
      });
    } else {
      inputs[0].focus();
    }
  };

  const handleKeyDown = (e: any) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const index = inputs.indexOf(e.target);
      if (index > 0) {
        inputs[index - 1].value = "";
        inputs[index - 1].focus();
      }
    }
  };

  const handleInput = (e: any) => {
    const { target } = e;
    const index = inputs.indexOf(target);
    if (target.value) {
      appendToInputValue(target.value);
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else {
        submitRef?.focus();
      }
    }
  };

  const handleFocus = (e: any) => {
    e.target.select();
  };

  const handlePaste = (e: any) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    inputs.forEach((input, index) => (input.value = digits[index]));
    appendToInputValue(text);
    submitRef?.focus();
  };

  const addInputItems = () => {
    for (let i = 0; i < codeLength; i++) {
      inputs.push(
        <InputItem
          handleFocus={handleFocus}
          handleInput={handleInput}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
        />,
      );
    }
    return inputs;
  };

  return (
    <div
      class={clsx(
        "typebot-input-form flex w-full gap-2 items-end max-w-[350px]",
      )}
    >
      <div class={"flex typebot-input w-full"}>
        <div class="max-w-md mx-auto text-center px-4 sm:px-8 py-8 rounded-xl">
          <div class="flex items-center justify-center gap-3">
            {addInputItems()}
          </div>
          <div class="max-w-[260px] mx-auto mt-4">
            <Switch>
              <Match when={true}>
                <SendButton
                  ref={submitRef}
                  type="button"
                  on:click={submit}
                  class="h-[48px] inline-flex justify-center"
                >
                  {props.block.options?.labels?.button}
                </SendButton>
              </Match>
            </Switch>
          </div>
          {
            <div class="text-sm text-slate-500 mt-4">
              Didn't receive code?{" "}
              <a
                class="font-medium text-indigo-500 hover:text-indigo-600"
                href="#0"
                on:click={resendCode}
              >
                Resend
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  );
};
