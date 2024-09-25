import { SendButton, Spinner } from "@/components/SendButton";
import { parseVariables } from "@/features/variables";
import { initStripe } from "@/lib/stripe";
import { useChat } from "@/providers/ChatProvider";
import { useTypebot } from "@/providers/TypebotProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React, { type FormEvent, useEffect, useState } from "react";
import { createPaymentIntentQuery } from "../../queries/createPaymentIntentQuery";

type Props = {
  options: PaymentInputBlock["options"];
  onSuccess: () => void;
};

export const StripePaymentForm = ({ options, onSuccess }: Props) => {
  const {
    apiHost,
    isPreview,
    typebot: { variables },
    onNewLog,
  } = useTypebot();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [amountLabel, setAmountLabel] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await createPaymentIntentQuery({
        apiHost,
        isPreview,
        variables,
        inputOptions: options,
      });
      if (error)
        return onNewLog({
          status: "error",
          description: error.name + " " + error.message,
          details: error.message,
        });
      if (!data || !document) return;
      await initStripe(document);
      if (!window?.Stripe) return;
      setStripe(window.Stripe(data.publicKey));
      setClientSecret(data.clientSecret);
      setAmountLabel(data.amountLabel);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stripe || !clientSecret) return <Spinner className="text-blue-500" />;
  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm
        onSuccess={onSuccess}
        clientSecret={clientSecret}
        amountLabel={amountLabel}
        options={options}
        variables={variables}
        viewerHost={apiHost}
      />
    </Elements>
  );
};

const CheckoutForm = ({
  onSuccess,
  clientSecret,
  amountLabel,
  options,
  variables,
  viewerHost,
}: {
  onSuccess: () => void;
  clientSecret: string;
  amountLabel: string;
  options: PaymentInputBlock["options"];
  variables: Variable[];
  viewerHost: string;
}) => {
  const { scroll } = useChat();
  const [ignoreFirstPaymentIntentCall, setIgnoreFirstPaymentIntentCall] =
    useState(true);

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const [isPayButtonVisible, setIsPayButtonVisible] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    if (ignoreFirstPaymentIntentCall)
      return setIgnoreFirstPaymentIntentCall(false);

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // TO-DO: Handle redirection correctly.
        return_url: viewerHost,
        payment_method_data: {
          billing_details: {
            name: options?.additionalInformation?.name
              ? parseVariables(variables)(options.additionalInformation.name)
              : undefined,
            email: options?.additionalInformation?.email
              ? parseVariables(variables)(options.additionalInformation?.email)
              : undefined,
            phone: options?.additionalInformation?.phoneNumber
              ? parseVariables(variables)(
                  options.additionalInformation?.phoneNumber,
                )
              : undefined,
          },
        },
      },
      redirect: "if_required",
    });

    setIsLoading(false);
    if (error?.type === "validation_error") return;
    if (error?.type === "card_error") return setMessage(error.message);
    if (!error && paymentIntent.status === "succeeded") return onSuccess();
  };

  const showPayButton = () => {
    setIsPayButtonVisible(true);
    scroll();
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      className="flex flex-col rounded-lg p-4 typebot-input w-full items-center"
    >
      <PaymentElement
        id="payment-element"
        className="w-full"
        onReady={showPayButton}
      />
      {isPayButtonVisible && (
        <SendButton
          label={`${options?.labels?.button} ${amountLabel}`}
          isDisabled={isLoading || !stripe || !elements}
          isLoading={isLoading}
          className="mt-4 w-full max-w-lg"
          disableIcon
        />
      )}

      {message && (
        <div
          id="payment-message"
          className="typebot-input-error-message mt-4 text-center"
        >
          {message}
        </div>
      )}
    </form>
  );
};
