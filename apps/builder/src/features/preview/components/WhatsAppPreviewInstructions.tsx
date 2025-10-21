import {
  HStack,
  SlideFade,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { isEmpty } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { type FormEvent, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { BuoyIcon, ExternalLinkIcon } from "@/components/icons";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/queryClient";
import {
  getPhoneNumberFromLocalStorage,
  setPhoneNumberInLocalStorage,
} from "../helpers/phoneNumberFromLocalStorage";

export const WhatsAppPreviewInstructions = (props: StackProps) => {
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
    <Stack
      as="form"
      spacing={4}
      overflowY="auto"
      w="full"
      px="1"
      onSubmit={sendWhatsAppPreviewStartMessage}
      {...props}
    >
      <HStack justifyContent="flex-end">
        <Text fontSize="sm">Need help?</Text>
        <ButtonLink
          href="https://docs.typebot.io/deploy/whatsapp/overview"
          size="sm"
          variant="secondary"
        >
          <BuoyIcon />
          Check the docs
        </ButtonLink>
      </HStack>
      <Field.Root>
        <Field.Label>Your phone number</Field.Label>
        <DebouncedTextInput
          placeholder="+XXXXXXXXXXXX"
          type="tel"
          debounceTimeout={0}
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
      <SlideFade offsetY="20px" in={isMessageSent} unmountOnExit>
        <Stack>
          <ButtonLink href={`https://web.whatsapp.com/`} target="_blank">
            Open WhatsApp Web
            <ExternalLinkIcon />
          </ButtonLink>
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <Alert.Title>Chat started!</Alert.Title>
            <Alert.Description>
              The first message can take up to 2 min to be delivered.
            </Alert.Description>
          </Alert.Root>
        </Stack>
      </SlideFade>
    </Stack>
  );
};
