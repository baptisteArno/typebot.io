import { useMutation } from "@tanstack/react-query";
import { isEmpty } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { Book02Icon } from "@typebot.io/ui/icons/Book02Icon";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { type FormEvent, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/queryClient";
import {
  getPhoneNumberFromLocalStorage,
  setPhoneNumberInLocalStorage,
} from "../helpers/phoneNumberFromLocalStorage";

export const WhatsAppPreviewInstructions = ({
  className,
}: {
  className?: string;
}) => {
  const { typebot, save } = useTypebot();
  const { startPreviewFrom } = useEditor();
  const [phoneNumber, setPhoneNumber] = useState(
    getPhoneNumberFromLocalStorage() ?? "",
  );
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false);

  const { mutate } = useMutation(
    trpc.whatsApp.startWhatsAppPreview.mutationOptions({
      onMutate: () => setIsSendingMessage(true),
      onSettled: () => setIsSendingMessage(false),
      onSuccess: async (data) => {
        if (
          data?.message === "success" &&
          phoneNumber !== getPhoneNumberFromLocalStorage()
        )
          setPhoneNumberInLocalStorage(phoneNumber);
        setHasMessageBeenSent(true);
        setIsMessageSent(true);
        setTimeout(() => setIsMessageSent(false), 30000);
      },
    }),
  );

  const sendWhatsAppPreviewStartMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!typebot) return;
    await save();
    mutate({
      to: phoneNumber,
      typebotId: typebot.id,
      startFrom:
        startPreviewFrom?.type === "group"
          ? { type: "group", groupId: startPreviewFrom.id }
          : startPreviewFrom?.type === "event"
            ? { type: "event", eventId: startPreviewFrom.id }
            : undefined,
    });
  };

  return (
    <form
      className={cn(
        "flex flex-col gap-4 overflow-y-auto w-full px-1",
        className,
      )}
      onSubmit={sendWhatsAppPreviewStartMessage}
    >
      <div className="flex items-center gap-2 justify-end">
        <p className="text-sm">Need help?</p>
        <ButtonLink
          href="https://docs.typebot.io/deploy/whatsapp/overview"
          size="sm"
          variant="secondary"
        >
          <Book02Icon />
          Check the docs
        </ButtonLink>
      </div>
      <Field.Root>
        <Field.Label>Your phone number</Field.Label>
        <Input
          placeholder="+XXXXXXXXXXXX"
          type="tel"
          defaultValue={phoneNumber}
          onValueChange={setPhoneNumber}
        />
      </Field.Root>
      {!isMessageSent && (
        <Button
          disabled={isEmpty(phoneNumber) || isMessageSent || isSendingMessage}
          type="submit"
        >
          {hasMessageBeenSent ? "Restart" : "Start"} the chat
        </Button>
      )}
      {isMessageSent && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-2">
          <ButtonLink href={`https://web.whatsapp.com/`} target="_blank">
            Open WhatsApp Web
            <ArrowUpRight01Icon />
          </ButtonLink>
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <Alert.Title>Chat started!</Alert.Title>
            <Alert.Description>
              The first message can take up to 2 min to be delivered.
            </Alert.Description>
          </Alert.Root>
        </div>
      )}
    </form>
  );
};
