import { useTranslate } from "@tolgee/react";
import { Avatar } from "@typebot.io/ui/components/Avatar";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { useState } from "react";
import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { useUser } from "../hooks/useUser";
import { ApiTokensList } from "./ApiTokensList";
import { ChangeEmailDialog } from "./ChangeEmailDialog";

export const MyAccountForm = () => {
  const { t } = useTranslate();
  const { user, updateUser, updateLocalUserEmail } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateUser({ name: newName });
  };

  return (
    <div className="flex flex-col gap-6 w-full overflow-y-auto">
      <div className="flex items-center gap-6">
        <Avatar.Root className="size-12">
          <Avatar.Image src={user?.image ?? undefined} alt="User" />
          <Avatar.Fallback>{user?.name?.charAt(0)}</Avatar.Fallback>
        </Avatar.Root>
        <div className="flex flex-col gap-2">
          {user?.id && (
            <UploadButton
              fileType="image"
              variant="secondary"
              filePathProps={{
                userId: user.id,
                fileName: "avatar",
              }}
              onFileUploaded={handleFileUploaded}
            >
              {t("account.myAccount.changePhotoButton.label")}
            </UploadButton>
          )}
          <p className="text-sm" color="gray.500">
            {t("account.myAccount.changePhotoButton.specification")}
          </p>
        </div>
      </div>
      <Field.Root>
        <Field.Label>{t("account.myAccount.nameInput.label")}</Field.Label>
        <Input defaultValue={name} onValueChange={handleNameChange} />
      </Field.Root>
      {user && (
        <div className="flex items-center gap-2 justify-between">
          <div className="flex flex-col gap-2">
            <p>{t("account.myAccount.emailInput.label")}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsChangeEmailDialogOpen(true)}
          >
            Change email
          </Button>
          <ChangeEmailDialog
            isOpen={isChangeEmailDialogOpen}
            onClose={(newEmail) => {
              setIsChangeEmailDialogOpen(false);
              if (newEmail) updateLocalUserEmail(newEmail);
            }}
            userEmail={user?.email ?? ""}
          />
        </div>
      )}
      {user && <ApiTokensList />}
    </div>
  );
};
