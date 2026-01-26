"use client";

import { Button } from "@typebot.io/ui/components/Button";
import { useState, useTransition } from "react";
import { orpcClient } from "@/lib/queryClient";

type Props = {
  email?: string;
  token?: string;
  isValid: boolean;
};

type Status =
  | "confirm"
  | "unsubscribed"
  | "unsubscribe-failed"
  | "resubscribed"
  | "already-subscribed"
  | "blocked"
  | "unknown"
  | "invalid";

export const UnsubscribePageClient = ({ email, token, isValid }: Props) => {
  const [status, setStatus] = useState<Status>(isValid ? "confirm" : "invalid");
  const [isPending, startTransition] = useTransition();

  const handleUnsubscribe = () => {
    if (!email || !token) return setStatus("invalid");
    startTransition(() => {
      void triggerUnsubscribe(email, token, setStatus);
    });
  };

  const handleResubscribe = () => {
    if (!email || !token) return setStatus("invalid");
    startTransition(() => {
      void triggerResubscribe(email, token, setStatus);
    });
  };

  const { message, helperText } = getCopy(status);
  const showUnsubscribe = status === "confirm";
  const showResubscribe = status === "unsubscribed";

  return (
    <main className="flex flex-col gap-4 h-dvh justify-center items-center text-gray-12 px-8 py-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col p-8 rounded-lg gap-6 bg-gray-1">
          <div className="flex flex-col gap-3">
            <h1 className="text-base font-semibold text-balance">
              Email preferences
            </h1>
            <p className="text-sm leading-relaxed text-pretty">{message}</p>
            {helperText ? (
              <p className="text-sm leading-relaxed text-gray-11 text-pretty">
                {helperText}
              </p>
            ) : null}
          </div>
          {showUnsubscribe ? (
            <Button
              onClick={handleUnsubscribe}
              disabled={isPending}
              className="self-start"
            >
              Unsubscribe
            </Button>
          ) : null}
          {showResubscribe ? (
            <Button
              onClick={handleResubscribe}
              disabled={isPending}
              className="self-start"
            >
              Resubscribe
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  );
};

const triggerUnsubscribe = async (
  email: string,
  token: string,
  setStatus: (status: Status) => void,
) => {
  try {
    await orpcClient.emails.unsubscribe({
      query: { email, token },
    });
    setStatus("unsubscribed");
  } catch {
    setStatus("unsubscribe-failed");
  }
};

const triggerResubscribe = async (
  email: string,
  token: string,
  setStatus: (status: Status) => void,
) => {
  try {
    const response = await orpcClient.emails.resubscribe({
      query: { email, token },
    });
    setStatus(response.status);
  } catch {
    setStatus("unknown");
  }
};

const getCopy = (status: Status) => {
  if (status === "invalid")
    return { message: "This unsubscribe link is invalid." };
  if (status === "confirm")
    return {
      message: "Confirm unsubscribe.",
      helperText: "Click the button below to stop receiving these emails.",
    };
  if (status === "unsubscribed")
    return {
      message: "Successfully unsubscribed.",
      helperText: "You will stop receiving these emails within 48 hours.",
    };
  if (status === "resubscribed")
    return {
      message: "You are resubscribed.",
      helperText: "It can take up to 48 hours for emails to resume.",
    };
  if (status === "blocked")
    return {
      message: "We could not resubscribe this email.",
      helperText:
        "This address had multiple bounces, so resubscribe is disabled.",
    };
  if (status === "already-subscribed")
    return {
      message: "You are already subscribed.",
    };
  return {
    message: "We could not update your email preferences.",
  };
};
