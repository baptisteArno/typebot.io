import { Heading, HStack } from "@chakra-ui/react";
import { capitalize } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { ChevronLeftIcon } from "@/components/icons";
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
        <Alert.Root>
          <InformationSquareIcon />
          <Alert.Description>
            You need to publish your bot first.
          </Alert.Description>
        </Alert.Root>
      )}
      {!selectedEmbedType ? (
        <EmbedTypeMenu onSelectEmbedType={onSelectEmbedType} />
      ) : (
        children
      )}
    </Dialog.Popup>
  </Dialog.Root>
);
