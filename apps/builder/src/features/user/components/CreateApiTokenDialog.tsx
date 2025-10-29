import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Input } from "@typebot.io/ui/components/Input";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
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
            <p>
              {t("account.apiTokens.createModal.copyInstruction")}{" "}
              <strong>
                {t("account.apiTokens.createModal.securityWarning")}
              </strong>
            </p>
            <CopyInput value={newTokenValue} />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <p>{t("account.apiTokens.createModal.nameInput.label")}</p>
            <Input
              ref={inputRef}
              placeholder={t(
                "account.apiTokens.createModal.nameInput.placeholder",
              )}
              onValueChange={setName}
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
