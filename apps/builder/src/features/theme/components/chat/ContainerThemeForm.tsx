import { FormLabel, HStack, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  borderRoundness,
  defaultOpacity,
  shadows,
} from "@typebot.io/theme/constants";
import type {
  ContainerBorderTheme,
  ContainerTheme,
  InputTheme,
} from "@typebot.io/theme/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { ColorPicker } from "../../../../components/ColorPicker";

type Props<T extends ((placeholder: string) => void) | undefined> = {
  theme: (T extends undefined ? ContainerTheme : InputTheme) | undefined;
  defaultTheme: T extends undefined ? ContainerTheme : InputTheme;
  placeholderColor?: T extends undefined ? never : string;
  testId?: string;
  onThemeChange: (
    theme: T extends undefined ? ContainerTheme : InputTheme,
  ) => void;
  onPlaceholderColorChange?: T;
};

export const ContainerThemeForm = <
  T extends ((placeholder: string) => void) | undefined,
>({
  theme,
  testId,
  defaultTheme,
  onPlaceholderColorChange,
  onThemeChange,
}: Props<T>) => {
  const { t } = useTranslate();

  const updateBackgroundColor = (backgroundColor: string) =>
    onThemeChange({ ...theme, backgroundColor });

  const toggleBackgroundColor = () =>
    onThemeChange({
      ...theme,
      backgroundColor:
        backgroundColor === "transparent" ? "#ffffff" : "transparent",
    });

  const updateTextColor = (color: string) => onThemeChange({ ...theme, color });

  const updateShadow = (shadow?: ContainerTheme["shadow"]) =>
    onThemeChange({ ...theme, shadow });

  const updateBlur = (blur?: number) => onThemeChange({ ...theme, blur });

  const updateOpacity = (opacity?: number) =>
    onThemeChange({ ...theme, opacity });

  const updateBorder = (border: ContainerBorderTheme) =>
    onThemeChange({ ...theme, border });

  const updatePlaceholderColor = (color: string) =>
    onThemeChange({ ...theme, placeholderColor: color } as InputTheme);

  const backgroundColor =
    theme?.backgroundColor ?? defaultTheme?.backgroundColor;

  const shadow = theme?.shadow ?? defaultTheme?.shadow ?? "none";

  return (
    <Stack spacing={4} data-testid={testId}>
      <HStack justify="space-between">
        <FormLabel mb="0" mr="0">
          {t("theme.sideMenu.chat.theme.background")}
        </FormLabel>
        <HStack>
          <Switch
            defaultChecked={backgroundColor !== "transparent"}
            onCheckedChange={toggleBackgroundColor}
          />
          <ColorPicker
            isDisabled={backgroundColor === "transparent"}
            value={backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </HStack>
      </HStack>

      <HStack justify="space-between">
        <FormLabel mb="0" mr="0">
          {t("theme.sideMenu.chat.theme.text")}
        </FormLabel>
        <ColorPicker
          value={theme?.color ?? defaultTheme?.color}
          onColorChange={updateTextColor}
        />
      </HStack>
      {onPlaceholderColorChange && (
        <HStack justify="space-between">
          <FormLabel mb="0" mr="0">
            {t("theme.sideMenu.chat.theme.placeholder")}
          </FormLabel>
          <ColorPicker
            value={
              theme && "placeholderColor" in theme
                ? theme.placeholderColor
                : defaultTheme && "placeholderColor" in defaultTheme
                  ? defaultTheme.placeholderColor
                  : undefined
            }
            onColorChange={updatePlaceholderColor}
          />
        </HStack>
      )}

      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>Border</Accordion.Trigger>
          <Accordion.Panel>
            <BorderThemeForm
              border={theme?.border}
              defaultBorder={defaultTheme.border}
              onBorderChange={updateBorder}
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Trigger>Advanced</Accordion.Trigger>
          <Accordion.Panel>
            {backgroundColor !== "transparent" && (
              <>
                <Field.Root className="flex-row">
                  <Field.Label>Opacity:</Field.Label>
                  <BasicNumberInput
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={theme?.opacity ?? defaultTheme?.opacity}
                    onValueChange={updateOpacity}
                    withVariableButton={false}
                  />
                </Field.Root>
                {(theme?.opacity ?? defaultTheme?.opacity) !== 1 && (
                  <Field.Root className="flex-row">
                    <Field.Label>Blur:</Field.Label>
                    <BasicNumberInput
                      min={0}
                      defaultValue={theme?.blur ?? defaultTheme?.blur}
                      onValueChange={updateBlur}
                      withVariableButton={false}
                    />
                  </Field.Root>
                )}
              </>
            )}
            <HStack justify="space-between">
              <FormLabel mb="0" mr="0">
                Shadow:
              </FormLabel>
              <HStack>
                <BasicSelect
                  size="sm"
                  value={shadow}
                  onChange={updateShadow}
                  items={shadows}
                />
              </HStack>
            </HStack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};

const BorderThemeForm = ({
  border,
  defaultBorder,
  onBorderChange,
}: {
  border: ContainerBorderTheme | undefined;
  defaultBorder: ContainerBorderTheme | undefined;
  onBorderChange: (border: ContainerBorderTheme) => void;
}) => {
  const updateRoundness = (
    roundeness: (typeof borderRoundness)[number] | undefined,
  ) => {
    onBorderChange({ ...border, roundeness });
  };

  const updateCustomRoundeness = (customRoundeness: number | undefined) => {
    onBorderChange({ ...border, customRoundeness });
  };

  const updateThickness = (thickness: number | undefined) => {
    onBorderChange({ ...border, thickness });
  };

  const updateColor = (color: string | undefined) => {
    onBorderChange({ ...border, color });
  };

  const updateOpacity = (opacity: number | undefined) => {
    onBorderChange({ ...border, opacity });
  };

  const thickness = border?.thickness ?? defaultBorder?.thickness ?? 0;

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Roundness:
        </FormLabel>
        <HStack>
          <BasicSelect
            size="sm"
            value={border?.roundeness}
            defaultValue={defaultBorder?.roundeness}
            onChange={updateRoundness}
            items={borderRoundness}
          />
          {(border?.roundeness ?? defaultBorder?.roundeness) === "custom" && (
            <Field.Root className="flex-row inline-flex items-center">
              <BasicNumberInput
                className="max-w-40"
                min={0}
                defaultValue={border?.customRoundeness}
                onValueChange={updateCustomRoundeness}
                withVariableButton={false}
              />
              px
            </Field.Root>
          )}
        </HStack>
      </HStack>

      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Thickness:
        </FormLabel>
        <BasicNumberInput
          min={0}
          defaultValue={thickness}
          onValueChange={updateThickness}
          withVariableButton={false}
        />
        <p>px</p>
      </HStack>

      {thickness > 0 && (
        <>
          <HStack justifyContent="space-between">
            <FormLabel mb="0" mr="0">
              Color:
            </FormLabel>
            <ColorPicker
              value={border?.color ?? defaultBorder?.color}
              onColorChange={updateColor}
            />
          </HStack>
          <Field.Root className="flex-row">
            <Field.Label>Opacity:</Field.Label>
            <BasicNumberInput
              min={0}
              max={1}
              step={0.1}
              defaultValue={border?.opacity ?? defaultOpacity}
              onValueChange={updateOpacity}
              withVariableButton={false}
            />
          </Field.Root>
        </>
      )}
    </Stack>
  );
};
