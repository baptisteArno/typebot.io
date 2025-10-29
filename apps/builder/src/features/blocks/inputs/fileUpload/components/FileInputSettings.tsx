import { useTranslate } from "@tolgee/react";
import {
  defaultFileInputOptions,
  fileVisibilityOptions,
} from "@typebot.io/blocks-inputs/file/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { TagsInput } from "@/components/TagsInput";

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
    visibility: (typeof fileVisibilityOptions)[number] | undefined,
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
    <div className="flex flex-col gap-4">
      <Field.Root className="flex-row items-center">
        <Switch
          checked={options?.isRequired ?? defaultFileInputOptions.isRequired}
          onCheckedChange={handleRequiredChange}
        />
        <Field.Label>
          {t("blocks.inputs.file.settings.required.label")}
        </Field.Label>
      </Field.Root>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={options?.allowedFileTypes?.isEnabled}
            onCheckedChange={updateAllowedFileTypesIsEnabled}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.file.settings.allowedFileTypes.label")}
          </Field.Label>
        </Field.Root>
        {options?.allowedFileTypes?.isEnabled && (
          <TagsInput
            items={options?.allowedFileTypes?.types}
            onValueChange={updateAllowedFileTypes}
            placeholder={t(
              "blocks.inputs.file.settings.allowedFileTypes.placeholder",
            )}
          />
        )}
      </Field.Container>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            options?.isMultipleAllowed ??
            defaultFileInputOptions.isMultipleAllowed
          }
          onCheckedChange={handleMultipleFilesChange}
        />
        <Field.Label>
          {t("blocks.inputs.file.settings.allowMultiple.label")}
        </Field.Label>
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {options?.isMultipleAllowed
            ? t("blocks.inputs.file.settings.saveMultipleUpload.label")
            : t("blocks.inputs.file.settings.saveSingleUpload.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          Visibility:
          <MoreInfoTooltip>
            This setting determines who can see the uploaded files. "Public"
            means that anyone who has the link can see the files. "Private"
            means that only a member of this workspace can see the files. Check
            the docs for more information.
          </MoreInfoTooltip>
        </Field.Label>
        <BasicSelect
          value={options?.visibility}
          defaultValue={defaultFileInputOptions.visibility}
          onChange={updateVisibility}
          items={fileVisibilityOptions}
        />
      </Field.Root>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("blocks.inputs.file.settings.labels")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.settings.placeholder.label")}
              </Field.Label>
              <CodeEditor
                lang="html"
                onChange={handlePlaceholderLabelChange}
                defaultValue={
                  options?.labels?.placeholder ??
                  defaultFileInputOptions.labels.placeholder
                }
                withVariableButton={false}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.settings.button.label")}
              </Field.Label>
              <DebouncedTextInput
                defaultValue={
                  options?.labels?.button ??
                  defaultFileInputOptions.labels.button
                }
                onValueChange={handleButtonLabelChange}
              />
            </Field.Root>
            {options?.isMultipleAllowed && (
              <Field.Root>
                <Field.Label>
                  {t("blocks.inputs.file.settings.clear.label")}
                </Field.Label>
                <DebouncedTextInput
                  defaultValue={
                    options?.labels?.clear ??
                    defaultFileInputOptions.labels.clear
                  }
                  onValueChange={updateClearButtonLabel}
                />
              </Field.Root>
            )}
            {!(options?.isRequired ?? defaultFileInputOptions.isRequired) && (
              <Field.Root>
                <Field.Label>
                  {t("blocks.inputs.file.settings.skip.label")}
                </Field.Label>
                <DebouncedTextInput
                  defaultValue={
                    options?.labels?.skip ?? defaultFileInputOptions.labels.skip
                  }
                  onValueChange={updateSkipButtonLabel}
                />
              </Field.Root>
            )}
            <Field.Root>
              <Field.Label>Single file success</Field.Label>
              <DebouncedTextInput
                defaultValue={
                  options?.labels?.success?.single ??
                  defaultFileInputOptions.labels.success.single
                }
                onValueChange={updateSingleFileSuccessLabel}
              />
            </Field.Root>
            {options?.isMultipleAllowed && (
              <Field.Root>
                <Field.Label>
                  Multi files success
                  <MoreInfoTooltip>
                    Include {"{total}"} to show the total number of files
                    uploaded
                  </MoreInfoTooltip>
                </Field.Label>
                <DebouncedTextInput
                  defaultValue={
                    options?.labels?.success?.multiple ??
                    defaultFileInputOptions.labels.success.multiple
                  }
                  onValueChange={updateMultipleFilesSuccessLabel}
                />
              </Field.Root>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};
