import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { TextInput } from "@/components/inputs/TextInput";
import { Avatar, HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import type React from "react";
import { useState } from "react";
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
    <Stack spacing="6" w="full" overflowY="auto">
      <HStack spacing={6}>
        <Avatar
          size="lg"
          src={user?.image ?? undefined}
          name={user?.name ?? undefined}
        />
        <Stack>
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
          <Text color="gray.500" fontSize="sm">
            {t("account.myAccount.changePhotoButton.specification")}
          </Text>
        </Stack>
      </HStack>

      <TextInput
        defaultValue={name}
        onChange={handleNameChange}
        label={t("account.myAccount.nameInput.label")}
        withVariableButton={false}
        debounceTimeout={0}
      />
      {user && (
        <HStack justifyContent="space-between">
          <Stack>
            <Text>{t("account.myAccount.emailInput.label")}</Text>
            <Text size="sm" color="gray.500">
              {user?.email}
            </Text>
          </Stack>
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
        </HStack>
      )}
      {user && <ApiTokensList user={user} />}
    </Stack>
  );
};
