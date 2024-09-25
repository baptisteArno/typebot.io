import { DropdownList } from "@/components/DropdownList";
import { NumberInput, TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: RatingInputBlock["options"];
  onOptionsChange: (options: RatingInputBlock["options"]) => void;
};

export const RatingInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const handleLengthChange = (length: number) =>
    onOptionsChange({ ...options, length });

  const handleTypeChange = (buttonType: "Icons" | "Numbers") =>
    onOptionsChange({ ...options, buttonType });

  const handleCustomIconCheck = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, isEnabled },
    });

  const handleIconSvgChange = (svg: string) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, svg },
    });

  const handleLeftLabelChange = (left: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, left } });

  const handleRightLabelChange = (right: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, right } });

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });

  const handleOneClickSubmitChange = (isOneClickSubmitEnabled: boolean) =>
    onOptionsChange({ ...options, isOneClickSubmitEnabled });

  const updateStartsAt = (startsAt: number | `{{${string}}}` | undefined) =>
    onOptionsChange({ ...options, startsAt });

  const length = options?.length ?? defaultRatingInputOptions.length;
  const isOneClickSubmitEnabled =
    options?.isOneClickSubmitEnabled ??
    defaultRatingInputOptions.isOneClickSubmitEnabled;

  const buttonType =
    options?.buttonType ?? defaultRatingInputOptions.buttonType;
  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          {t("blocks.inputs.rating.settings.maximum.label")}
        </FormLabel>
        <DropdownList
          onItemSelect={handleLengthChange}
          items={[3, 4, 5, 6, 7, 8, 9, 10]}
          currentItem={length}
        />
      </Stack>

      <Stack>
        <FormLabel mb="0" htmlFor="button">
          {t("blocks.inputs.rating.settings.type.label")}
        </FormLabel>
        <DropdownList
          onItemSelect={handleTypeChange}
          items={["Icons", "Numbers"] as const}
          currentItem={buttonType}
        />
      </Stack>

      {buttonType === "Numbers" && (
        <NumberInput
          defaultValue={options?.startsAt ?? defaultRatingInputOptions.startsAt}
          onValueChange={updateStartsAt}
          label="Starts at"
          direction="row"
        />
      )}

      {buttonType === "Icons" && (
        <SwitchWithLabel
          label={t("blocks.inputs.rating.settings.customIcon.label")}
          initialValue={
            options?.customIcon?.isEnabled ??
            defaultRatingInputOptions.customIcon.isEnabled
          }
          onCheckChange={handleCustomIconCheck}
        />
      )}
      {buttonType === "Icons" && options?.customIcon?.isEnabled && (
        <TextInput
          label={t("blocks.inputs.rating.settings.iconSVG.label")}
          defaultValue={options.customIcon.svg}
          onChange={handleIconSvgChange}
          placeholder="<svg>...</svg>"
        />
      )}
      <TextInput
        label={t("blocks.inputs.rating.settings.rateLabel.label", {
          rate:
            buttonType === "Icons"
              ? "1"
              : (options?.startsAt ?? defaultRatingInputOptions.startsAt),
        })}
        defaultValue={options?.labels?.left}
        onChange={handleLeftLabelChange}
        placeholder={t(
          "blocks.inputs.rating.settings.notLikely.placeholder.label",
        )}
      />
      <TextInput
        label={t("blocks.inputs.rating.settings.rateLabel.label", {
          rate: length,
        })}
        defaultValue={options?.labels?.right}
        onChange={handleRightLabelChange}
        placeholder={t(
          "blocks.inputs.rating.settings.extremelyLikely.placeholder.label",
        )}
      />
      <SwitchWithLabel
        label={t("blocks.inputs.rating.settings.oneClickSubmit.label")}
        moreInfoContent={t(
          "blocks.inputs.rating.settings.oneClickSubmit.infoText.label",
        )}
        initialValue={isOneClickSubmitEnabled}
        onCheckChange={handleOneClickSubmitChange}
      />
      {!isOneClickSubmitEnabled && (
        <TextInput
          label={t("blocks.inputs.settings.button.label")}
          defaultValue={
            options?.labels?.button ?? defaultRatingInputOptions.labels.button
          }
          onChange={handleButtonLabelChange}
        />
      )}
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  );
};
