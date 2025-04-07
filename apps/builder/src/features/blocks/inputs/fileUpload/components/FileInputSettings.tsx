import { DropdownList } from "@/components/DropdownList";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TagsInput } from "@/components/TagsInput";
import { TextInput } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormControl,
  FormLabel,
  Stack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  defaultFileInputOptions,
  fileVisibilityOptions,
} from "@typebot.io/blocks-inputs/file/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: FileInputBlock["options"];
  onOptionsChange: (options: FileInputBlock["options"]) => void;
};

export const FileInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const updateAllowedFileTypes = (allowedFileTypes: string[]) =>
    onOptionsChange({
      ...options,
      allowedFileTypes: {
        ...options?.allowedFileTypes,
        types: allowedFileTypes,
      },
    });

  const updateAllowedFileTypesIsEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      allowedFileTypes: { ...options?.allowedFileTypes, isEnabled },
    });

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });

  const handlePlaceholderLabelChange = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });

  const handleMultipleFilesChange = (isMultipleAllowed: boolean) =>
    onOptionsChange({ ...options, isMultipleAllowed });

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });

  const handleRequiredChange = (isRequired: boolean) =>
    onOptionsChange({ ...options, isRequired });

  const updateClearButtonLabel = (clear: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, clear } });

  const updateSkipButtonLabel = (skip: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, skip } });

  const updateVisibility = (
    visibility: (typeof fileVisibilityOptions)[number],
  ) => onOptionsChange({ ...options, visibility });

  const updateSingleFileSuccessLabel = (single: string) =>
    onOptionsChange({
      ...options,
      labels: {
        ...options?.labels,
        success: { ...options?.labels?.success, single },
      },
    });

  const updateMultipleFilesSuccessLabel = (multiple: string) =>
    onOptionsChange({
      ...options,
      labels: {
        ...options?.labels,
        success: { ...options?.labels?.success, multiple },
      },
    });

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label={t("blocks.inputs.file.settings.required.label")}
        initialValue={options?.isRequired ?? defaultFileInputOptions.isRequired}
        onCheckChange={handleRequiredChange}
      />
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.file.settings.allowedFileTypes.label")}
        initialValue={options?.allowedFileTypes?.isEnabled}
        onCheckChange={updateAllowedFileTypesIsEnabled}
      >
        <TagsInput
          items={options?.allowedFileTypes?.types}
          onChange={updateAllowedFileTypes}
          placeholder={t(
            "blocks.inputs.file.settings.allowedFileTypes.placeholder",
          )}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithLabel
        label={t("blocks.inputs.file.settings.allowMultiple.label")}
        initialValue={
          options?.isMultipleAllowed ??
          defaultFileInputOptions.isMultipleAllowed
        }
        onCheckChange={handleMultipleFilesChange}
      />

      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {options?.isMultipleAllowed
            ? t("blocks.inputs.file.settings.saveMultipleUpload.label")
            : t("blocks.inputs.file.settings.saveSingleUpload.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>

      <DropdownList
        label="Visibility:"
        direction="row"
        moreInfoTooltip='This setting determines who can see the uploaded files. "Public" means that anyone who has the link can see the files. "Private" means that only a member of this workspace can see the files. Check the docs for more information.'
        currentItem={options?.visibility ?? defaultFileInputOptions.visibility}
        onItemSelect={updateVisibility}
        items={fileVisibilityOptions}
      />

      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("blocks.inputs.file.settings.labels")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as={Stack} spacing={4}>
            <Stack>
              <FormLabel mb="0">
                {t("blocks.inputs.settings.placeholder.label")}
              </FormLabel>
              <CodeEditor
                lang="html"
                onChange={handlePlaceholderLabelChange}
                defaultValue={
                  options?.labels?.placeholder ??
                  defaultFileInputOptions.labels.placeholder
                }
                height={"100px"}
                withVariableButton={false}
              />
            </Stack>
            <TextInput
              label={t("blocks.inputs.settings.button.label")}
              defaultValue={
                options?.labels?.button ?? defaultFileInputOptions.labels.button
              }
              onChange={handleButtonLabelChange}
              withVariableButton={false}
            />
            {options?.isMultipleAllowed && (
              <TextInput
                label={t("blocks.inputs.file.settings.clear.label")}
                defaultValue={
                  options?.labels?.clear ?? defaultFileInputOptions.labels.clear
                }
                onChange={updateClearButtonLabel}
                withVariableButton={false}
              />
            )}
            {!(options?.isRequired ?? defaultFileInputOptions.isRequired) && (
              <TextInput
                label={t("blocks.inputs.file.settings.skip.label")}
                defaultValue={
                  options?.labels?.skip ?? defaultFileInputOptions.labels.skip
                }
                onChange={updateSkipButtonLabel}
                withVariableButton={false}
              />
            )}
            <TextInput
              label="Single file success"
              defaultValue={
                options?.labels?.success?.single ??
                defaultFileInputOptions.labels.success.single
              }
              onChange={updateSingleFileSuccessLabel}
              withVariableButton={false}
            />
            {options?.isMultipleAllowed && (
              <TextInput
                label="Multi files success"
                moreInfoTooltip="Include {total} to show the total number of files uploaded"
                defaultValue={
                  options?.labels?.success?.multiple ??
                  defaultFileInputOptions.labels.success.multiple
                }
                onChange={updateMultipleFilesSuccessLabel}
                withVariableButton={false}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
