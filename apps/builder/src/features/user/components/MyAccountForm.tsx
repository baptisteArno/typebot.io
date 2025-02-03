import { UploadButton } from "@/components/ImageUploadContent/UploadButton";
import { UploadIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs/TextInput";
import { Avatar, HStack, Stack, Text, Tooltip } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import React, { useState } from "react";
import { useUser } from "../hooks/useUser";
import { ApiTokensList } from "./ApiTokensList";

export const MyAccountForm = () => {
  const { t } = useTranslate();
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const handleFileUploaded = async (url: string) => {
    updateUser({ image: url });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateUser({ name: newName });
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    updateUser({ email: newEmail });
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
              size="sm"
              fileType="image"
              filePathProps={{
                userId: user.id,
                fileName: "avatar",
              }}
              leftIcon={<UploadIcon />}
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
      <Tooltip label={t("account.myAccount.emailInput.disabledTooltip")}>
        <span>
          <TextInput
            type="email"
            defaultValue={email}
            onChange={handleEmailChange}
            label={t("account.myAccount.emailInput.label")}
            withVariableButton={false}
            debounceTimeout={0}
            isDisabled
          />
        </span>
      </Tooltip>

      {user && <ApiTokensList user={user} />}
    </Stack>
  );
};
