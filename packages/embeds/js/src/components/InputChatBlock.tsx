import { Buttons } from "@/features/blocks/inputs/buttons/components/Buttons";
import { MultipleChoicesForm } from "@/features/blocks/inputs/buttons/components/MultipleChoicesForm";
import { CardsCaroussel } from "@/features/blocks/inputs/cards/CardsCaroussel";
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
import { TimeForm } from "@/features/blocks/inputs/time/components/TimeForm";
import { UrlInput } from "@/features/blocks/inputs/url/components/UrlInput";
import type { BotContext, ChatChunk, InputSubmitContent } from "@/types";
import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
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
import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import type {
  ContinueChatResponse,
  RuntimeOptions,
} from "@typebot.io/chat-api/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import { defaultHostAvatarIsEnabled } from "@typebot.io/theme/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { Match, Show, Switch } from "solid-js";
import { GuestBubble } from "./bubbles/GuestBubble";

type Props = {
  ref: HTMLDivElement | undefined;
  input: NonNullable<ChatChunk["input"]>;
  chunkIndex: number;
  context: BotContext;
  isInputPrefillEnabled: boolean;
  theme: Theme;
  onTransitionEnd: () => void;
  onSubmit: (content: InputSubmitContent) => void;
  onSkip: (label: string) => void;
};

export const InputChatBlock = (props: Props) => {
  const handleSubmit = async (content: InputSubmitContent) => {
    props.onSubmit(content);
  };

  const handleSkip = (label: string) => {
    props.onSkip(label);
  };

  return (
    <Switch>
      <Match when={props.input.answer && props.input.answer.status !== "retry"}>
        <GuestBubble answer={props.input.answer} theme={props.theme} />
      </Match>
      <Match
        when={
          isNotDefined(props.input.answer) ||
          props.input.answer?.status === "retry"
        }
      >
        <div
          class="flex justify-end animate-fade-in gap-1 @xs:gap-2 typebot-input-container"
          data-blockid={props.input.id}
          ref={props.ref}
        >
          <Show
            when={
              props.theme.chat?.hostAvatar?.isEnabled ??
              defaultHostAvatarIsEnabled
            }
          >
            <div class="flex flex-shrink-0 items-center w-6 h-6 @xs:w-10 @xs:h-10" />
          </Show>
          <Input
            context={props.context}
            block={props.input}
            chunkIndex={props.chunkIndex}
            isInputPrefillEnabled={props.isInputPrefillEnabled}
            existingAnswer={
              props.input.answer?.status === "retry"
                ? getAnswerValue(props.input.answer)
                : undefined
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
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.NUMBER}>
        <NumberInput
          block={props.block as NumberInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.EMAIL}>
        <EmailInput
          block={props.block as EmailInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.URL}>
        <UrlInput
          block={props.block as UrlInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PHONE}>
        <PhoneInput
          labels={(props.block as PhoneNumberInputBlock).options?.labels}
          defaultCountryCode={
            (props.block as PhoneNumberInputBlock).options?.defaultCountryCode
          }
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.DATE}>
        <DateForm
          options={props.block.options as DateInputBlock["options"]}
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.TIME}>
        <TimeForm
          block={props.block as TimeInputBlock["options"]}
          defaultValue={getPrefilledValue()}
          onSubmit={props.onSubmit}
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
                onSubmit={props.onSubmit}
              />
            </Match>
            <Match when={block.options?.isMultipleChoice}>
              <MultipleChoicesForm
                defaultItems={block.items}
                options={block.options}
                onSubmit={props.onSubmit}
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
                onSubmit={props.onSubmit}
                onTransitionEnd={props.onTransitionEnd}
              />
            </Match>
            <Match when={block.options?.isMultipleChoice}>
              <MultiplePictureChoice
                defaultItems={block.items}
                options={block.options}
                onSubmit={props.onSubmit}
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
          onSubmit={props.onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.FILE}>
        <FileUploadForm
          context={props.context}
          block={props.block as FileInputBlock}
          onSubmit={props.onSubmit}
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
      <Match when={props.block.type === InputBlockType.CARDS}>
        <CardsCaroussel
          block={props.block as CardsBlock}
          onSubmit={props.onSubmit}
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
