import { SendButton } from "@/components/SendButton";
import type { BotContext } from "@/types";
import {
  type Stripe,
  type StripeElements,
  loadStripe,
} from "@stripe/stripe-js";
import { defaultPaymentInputOptions } from "@typebot.io/blocks-inputs/payment/constants";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import type { RuntimeOptions } from "@typebot.io/bot-engine/schemas/api";
import { Show, createSignal, onMount } from "solid-js";
import {
  removePaymentInProgressFromStorage,
  setPaymentInProgressInStorage,
} from "../helpers/paymentInProgressStorage";

type Props = {
  context: BotContext;
  options: PaymentInputBlock["options"] & RuntimeOptions;
  onSuccess: () => void;
  onTransitionEnd: () => void;
};

const slotName = "stripe-payment-form";

let paymentElementSlot: HTMLSlotElement;
let stripe: Stripe | null = null;
let elements: StripeElements | null = null;

export const StripePaymentForm = (props: Props) => {
  const [message, setMessage] = createSignal<string>();
  const [isMounted, setIsMounted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  onMount(async () => {
    initShadowMountPoint(paymentElementSlot);
    if (!props.options?.publicKey)
      return setMessage("Missing Stripe public key");
    stripe = await loadStripe(props.options?.publicKey);
    if (!stripe) return;
    elements = stripe.elements({
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: getComputedStyle(paymentElementSlot).getPropertyValue(
            "--typebot-button-bg-color",
          ),
        },
      },
      clientSecret: props.options.paymentIntentSecret,
    });
    const paymentElement = elements.create("payment", {
      layout: "tabs",
    });
    paymentElement.mount("#payment-element");
    setTimeout(() => {
      setIsMounted(true);
      props.onTransitionEnd();
    }, 1000);
  });

  const handleSubmit = async (event: Event & { submitter: HTMLElement }) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    setPaymentInProgressInStorage({
      sessionId: props.context.sessionId,
      resultId: props.context.resultId,
      typebot: props.context.typebot,
    });
    const { postalCode, ...address } =
      props.options?.additionalInformation?.address ?? {};
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: {
            name: props.options?.additionalInformation?.name,
            email: props.options?.additionalInformation?.email,
            phone: props.options?.additionalInformation?.phoneNumber,
            address: {
              ...address,
              postal_code: postalCode,
            },
          },
        },
      },
      redirect: "if_required",
    });
    removePaymentInProgressFromStorage();

    setIsLoading(false);
    if (error?.type === "validation_error") return;
    if (error?.type === "card_error") return setMessage(error.message);
    if (!error && paymentIntent.status === "succeeded")
      return props.onSuccess();
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      class="flex flex-col p-4 typebot-input w-full items-center"
    >
      <slot name={slotName} ref={paymentElementSlot} />
      <Show when={isMounted()}>
        <SendButton
          isLoading={isLoading()}
          class="mt-4 w-full max-w-lg animate-fade-in"
          disableIcon
        >
          {props.options?.labels?.button ??
            defaultPaymentInputOptions.labels.button}{" "}
          {props.options?.amountLabel}
        </SendButton>
      </Show>

      <Show when={message()}>
        <div class="typebot-input-error-message mt-4 text-center animate-fade-in">
          {message()}
        </div>
      </Show>
    </form>
  );
};

const initShadowMountPoint = (element: HTMLElement) => {
  const rootNode = element.getRootNode() as ShadowRoot;
  const host = rootNode.host;
  const slotPlaceholder = document.createElement("div");
  slotPlaceholder.style.width = "100%";
  slotPlaceholder.slot = slotName;
  host.appendChild(slotPlaceholder);
  const paymentElementContainer = document.createElement("div");
  paymentElementContainer.id = "payment-element";
  slotPlaceholder.appendChild(paymentElementContainer);
};
