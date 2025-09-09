import {
  Alert,
  AlertIcon,
  HStack,
  SlideFade,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { isEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { type FormEvent, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { BuoyIcon, ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs";
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
      <TextInput
        label="Your phone number"
        placeholder="+XXXXXXXXXXXX"
        type="tel"
        withVariableButton={false}
        debounceTimeout={0}
        defaultValue={phoneNumber}
        onChange={setPhoneNumber}
      />
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
          <Alert status="success" w="100%">
            <HStack>
              <AlertIcon />
              <Stack spacing={1}>
                <Text fontWeight="medium">Chat started!</Text>
                <Text fontSize="sm">
                  The first message can take up to 2 min to be delivered.
                </Text>
              </Stack>
            </HStack>
          </Alert>
        </Stack>
      </SlideFade>
    </Stack>
  );
};
