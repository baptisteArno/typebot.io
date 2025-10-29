import { capitalize } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { ArrowLeft01Icon } from "@typebot.io/ui/icons/ArrowLeft01Icon";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
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
        <div className="flex items-center gap-2">
          {selectedEmbedType && (
            <Button
              aria-label="back"
              variant="ghost"
              onClick={() => onSelectEmbedType(undefined)}
              size="icon"
            >
              <ArrowLeft01Icon />
            </Button>
          )}
          {titlePrefix}{" "}
          {selectedEmbedType && `- ${capitalize(selectedEmbedType)}`}
        </div>
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
