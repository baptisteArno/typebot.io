import { AlertInfo } from "@/components/AlertInfo";
import { ChevronLeftIcon } from "@/components/icons";
import { HStack, Heading } from "@chakra-ui/react";
import { capitalize } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { EmbedTypeMenu } from "./EmbedTypeMenu/EmbedTypeMenu";

type Props = {
  selectedEmbedType: "standard" | "popup" | "bubble" | undefined;
  titlePrefix: string;
  isOpen: boolean;
  isPublished: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSelectEmbedType: (
    type: "standard" | "popup" | "bubble" | undefined,
  ) => void;
};

export const DeployDialog = ({
  selectedEmbedType,
  isOpen,
  isPublished,
  titlePrefix,
  children,
  onSelectEmbedType,
  onClose,
}: Props) => (
  <Dialog.Root isOpen={isOpen} onClose={onClose}>
    <Dialog.Popup className="max-w-2xl">
      <Dialog.Title>
        <HStack>
          {selectedEmbedType && (
            <Button
              aria-label="back"
              variant="ghost"
              onClick={() => onSelectEmbedType(undefined)}
              size="icon"
            >
              <ChevronLeftIcon />
            </Button>
          )}
          <Heading size="md">
            {titlePrefix}{" "}
            {selectedEmbedType && `- ${capitalize(selectedEmbedType)}`}
          </Heading>
        </HStack>
      </Dialog.Title>
      <Dialog.CloseButton />
      {!isPublished && (
        <AlertInfo>You need to publish your bot first.</AlertInfo>
      )}
      {!selectedEmbedType ? (
        <EmbedTypeMenu onSelectEmbedType={onSelectEmbedType} />
      ) : (
        children
      )}
    </Dialog.Popup>
  </Dialog.Root>
);
