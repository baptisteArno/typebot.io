import { Input, InputGroup, InputRightElement, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { createApiTokenQuery } from "../queries/createApiTokenQuery";
import type { ApiTokenFromServer } from "../types";

type Props = {
  userId: string;
  isOpen: boolean;
  onNewToken: (token: ApiTokenFromServer) => void;
  onClose: () => void;
};

const ANIMATION_DURATION = 150;

export const CreateApiTokenDialog = ({
  userId,
  isOpen,
  onClose,
  onNewToken,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string>();

  const createToken = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data } = await createApiTokenQuery(userId, { name });
    if (data?.apiToken) {
      setNewTokenValue(data.apiToken.token);
      onNewToken(data.apiToken);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setTimeout(() => {
      setNewTokenValue(undefined);
      setName("");
    }, ANIMATION_DURATION);
    onClose();
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={handleClose}>
      <Dialog.Popup
        render={<form onSubmit={createToken} />}
        initialFocus={inputRef}
      >
        <Dialog.Title>
          {newTokenValue
            ? t("account.apiTokens.createModal.createdHeading")
            : t("account.apiTokens.createModal.createHeading")}
        </Dialog.Title>
        <Dialog.CloseButton />
        {newTokenValue ? (
          <>
            <Text>
              {t("account.apiTokens.createModal.copyInstruction")}{" "}
              <strong>
                {t("account.apiTokens.createModal.securityWarning")}
              </strong>
            </Text>
            <InputGroup size="md">
              <Input readOnly pr="4.5rem" value={newTokenValue} />
              <InputRightElement width="4.5rem">
                <CopyButton textToCopy={newTokenValue} />
              </InputRightElement>
            </InputGroup>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Text>{t("account.apiTokens.createModal.nameInput.label")}</Text>
            <Input
              ref={inputRef}
              placeholder={t(
                "account.apiTokens.createModal.nameInput.placeholder",
              )}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <Dialog.Footer>
          {newTokenValue ? null : (
            <Button
              disabled={name.length === 0 || isSubmitting}
              onClick={createToken}
              type="submit"
            >
              {t("account.apiTokens.createModal.createButton.label")}
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
