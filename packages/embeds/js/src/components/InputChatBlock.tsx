import { Buttons } from "@/features/blocks/inputs/buttons/components/Buttons";
import { MultipleChoicesForm } from "@/features/blocks/inputs/buttons/components/MultipleChoicesForm";
import { DateForm } from "@/features/blocks/inputs/date/components/DateForm";
import { EmailInput } from "@/features/blocks/inputs/email/components/EmailInput";
import { FileUploadForm } from "@/features/blocks/inputs/fileUpload/components/FileUploadForm";
import { NumberInput } from "@/features/blocks/inputs/number/components/NumberInput";
import { PaymentForm } from "@/features/blocks/inputs/payment/components/PaymentForm";
import { PhoneInput } from "@/features/blocks/inputs/phone/components/PhoneInput";
import { MultiplePictureChoice } from "@/features/blocks/inputs/pictureChoice/MultiplePictureChoice";
import { SinglePictureChoice } from "@/features/blocks/inputs/pictureChoice/SinglePictureChoice";
import { RatingForm } from "@/features/blocks/inputs/rating/components/RatingForm";
import { TextInput } from "@/features/blocks/inputs/textInput/components/TextInput";
import { UrlInput } from "@/features/blocks/inputs/url/components/UrlInput";
import type { BotContext, InputSubmitContent } from "@/types";
import { formattedMessages } from "@/utils/formattedMessagesSignal";
import { isMobile } from "@/utils/isMobileSignal";
import { persist } from "@/utils/persist";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { defaultPaymentInputOptions } from "@typebot.io/blocks-inputs/payment/constants";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import type {
  ContinueChatResponse,
  RuntimeOptions,
} from "@typebot.io/bot-engine/schemas/api";
import { isNotDefined } from "@typebot.io/lib/utils";
import { defaultGuestAvatarIsEnabled } from "@typebot.io/theme/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { GuestBubble } from "./bubbles/GuestBubble";

type Props = {
  ref: HTMLDivElement | undefined;
  block: NonNullable<ContinueChatResponse["input"]>;
  hasHostAvatar: boolean;
  guestAvatar?: NonNullable<Theme["chat"]>["guestAvatar"];
  chunkIndex: number;
  context: BotContext;
  isInputPrefillEnabled: boolean;
  hasError: boolean;
  onTransitionEnd: () => void;
  onSubmit: (content: InputSubmitContent) => void;
  onSkip: () => void;
};

export const InputChatBlock = (props: Props) => {
  const [answer, setAnswer] = persist(createSignal<InputSubmitContent>(), {
    key: `typebot-${props.context.typebot.id}-input-${props.chunkIndex}`,
    storage: props.context.storage,
  });

  const handleSubmit = async (content: InputSubmitContent) => {
    setAnswer(content);
    props.onSubmit(content);
  };

  const handleSkip = (label: string) => {
    setAnswer({ type: "text", value: label });
    props.onSkip();
  };

  createEffect(() => {
    const formattedMessage = formattedMessages().findLast(
      (message) => props.chunkIndex === message.inputIndex,
    )?.formattedMessage;
    if (formattedMessage && props.block.type !== InputBlockType.FILE)
      setAnswer((answer) =>
        answer?.type === "text"
          ? { ...answer, label: formattedMessage }
          : answer,
      );
  });

  return (
    <Switch>
      <Match when={answer() && !props.hasError}>
        <GuestBubble
          answer={answer()}
          showAvatar={
            props.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled
          }
          avatarSrc={props.guestAvatar?.url && props.guestAvatar.url}
          hasHostAvatar={props.hasHostAvatar}
        />
      </Match>
      <Match when={isNotDefined(answer()) || props.hasError}>
        <div
          class="flex justify-end animate-fade-in gap-2 typebot-input-container"
          data-blockid={props.block.id}
          ref={props.ref}
        >
          <Show when={props.hasHostAvatar}>
            <div
              class={
                "flex flex-shrink-0 items-center " +
                (isMobile() ? "w-6 h-6" : "w-10 h-10")
              }
            />
          </Show>
          <Input
            context={props.context}
            block={props.block}
            chunkIndex={props.chunkIndex}
            isInputPrefillEnabled={props.isInputPrefillEnabled}
            existingAnswer={
              props.hasError ? getAnswerValue(answer()!) : undefined
            }
            onTransitionEnd={props.onTransitionEnd}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
          />
        </div>
      </Match>
    </Switch>
  );
};

const getAnswerValue = (answer?: InputSubmitContent) => {
  if (!answer) return;
  return answer.type === "text" ? answer.value : answer.url;
};

const Input = (props: {
  context: BotContext;
  block: NonNullable<ContinueChatResponse["input"]>;
  chunkIndex: number;
  isInputPrefillEnabled: boolean;
  existingAnswer?: string;
  onTransitionEnd: () => void;
  onSubmit: (answer: InputSubmitContent) => void;
  onSkip: (label: string) => void;
}) => {
  const onSubmit = (answer: InputSubmitContent) => props.onSubmit(answer);

  const getPrefilledValue = () =>
    props.existingAnswer ??
    (props.isInputPrefillEnabled ? props.block.prefilledValue : undefined);

  const submitPaymentSuccess = () =>
    props.onSubmit({
      type: "text",
      value:
        (props.block.options as PaymentInputBlock["options"])?.labels
          ?.success ?? defaultPaymentInputOptions.labels.success,
    });

  return (
    <Switch>
      <Match when={props.block.type === InputBlockType.TEXT}>
        <TextInput
          block={props.block as TextInputBlock}
          defaultValue={getPrefilledValue()}
          context={props.context}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.NUMBER}>
        <NumberInput
          block={props.block as NumberInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.EMAIL}>
        <EmailInput
          block={props.block as EmailInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.URL}>
        <UrlInput
          block={props.block as UrlInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PHONE}>
        <PhoneInput
          labels={(props.block as PhoneNumberInputBlock).options?.labels}
          defaultCountryCode={
            (props.block as PhoneNumberInputBlock).options?.defaultCountryCode
          }
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.DATE}>
        <DateForm
          options={props.block.options as DateInputBlock["options"]}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={isButtonsBlock(props.block)} keyed>
        {(block) => (
          <Switch>
            <Match when={!block.options?.isMultipleChoice}>
              <Buttons
                chunkIndex={props.chunkIndex}
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
            <Match when={block.options?.isMultipleChoice}>
              <MultipleChoicesForm
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
          </Switch>
        )}
      </Match>
      <Match when={isPictureChoiceBlock(props.block)} keyed>
        {(block) => (
          <Switch>
            <Match when={!block.options?.isMultipleChoice}>
              <SinglePictureChoice
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
                onTransitionEnd={props.onTransitionEnd}
              />
            </Match>
            <Match when={block.options?.isMultipleChoice}>
              <MultiplePictureChoice
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
                onTransitionEnd={props.onTransitionEnd}
              />
            </Match>
          </Switch>
        )}
      </Match>
      <Match when={props.block.type === InputBlockType.RATING}>
        <RatingForm
          block={props.block as RatingInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.FILE}>
        <FileUploadForm
          context={props.context}
          block={props.block as FileInputBlock}
          onSubmit={onSubmit}
          onSkip={props.onSkip}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PAYMENT}>
        <PaymentForm
          context={props.context}
          options={
            {
              ...props.block.options,
              ...props.block.runtimeOptions,
            } as PaymentInputBlock["options"] & RuntimeOptions
          }
          onSuccess={submitPaymentSuccess}
          onTransitionEnd={props.onTransitionEnd}
        />
      </Match>
    </Switch>
  );
};

const isButtonsBlock = (
  block: ContinueChatResponse["input"],
): ChoiceInputBlock | undefined =>
  block?.type === InputBlockType.CHOICE ? block : undefined;

const isPictureChoiceBlock = (
  block: ContinueChatResponse["input"],
): PictureChoiceBlock | undefined =>
  block?.type === InputBlockType.PICTURE_CHOICE ? block : undefined;
