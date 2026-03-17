import { useForm } from "@tanstack/react-form";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Kbd } from "@typebot.io/ui/components/Kbd";
import { Select } from "@typebot.io/ui/components/Select";
import { Textarea } from "@typebot.io/ui/components/Textarea";
import { ArrowRight01Icon } from "@typebot.io/ui/icons/ArrowRight01Icon";
import { Schema } from "effect";
import { useMemo } from "react";
import {
  type ContactCreateInput,
  ContactCreateInputSchema,
} from "../../application/ContactsUsecases";
import type { ContactPropertyDefinitionData } from "../../domain/ContactPropertyDefinition";

const ContactFormOutputSchema = Schema.Struct({
  name: ContactCreateInputSchema.fields.name,
  properties: ContactCreateInputSchema.fields.properties,
  segmentIds: ContactCreateInputSchema.fields.segmentIds,
});
const ContactFormOutputsSchema = Schema.Array(ContactFormOutputSchema);

const AddContactFormSchema = Schema.Struct({
  contactsInput: Schema.NonEmptyString,
  propertyKeysMapping: Schema.Array(Schema.NullOr(Schema.String)).pipe(
    Schema.check(
      Schema.makeFilter(
        (val) =>
          (val.length > 0 && val.some((v) => v !== null)) ||
          "At least one property key is required",
        { description: "at least one property key mapping" },
      ),
    ),
  ),
});

export type AddContactFormProps = {
  propertyDefinitions: readonly Pick<
    ContactPropertyDefinitionData,
    "key" | "type"
  >[];
  onSubmit: (contacts: typeof ContactFormOutputsSchema.Type) => void;
  initialFocusRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export const AddContactForm = ({
  propertyDefinitions,
  onSubmit,
  initialFocusRef,
}: AddContactFormProps) => {
  const defaultPropertyKeysMapping: readonly (string | null)[] = [];

  const form = useForm({
    defaultValues: {
      contactsInput: "",
      propertyKeysMapping: defaultPropertyKeysMapping,
    },
    validators: {
      onSubmit: Schema.toStandardSchemaV1(AddContactFormSchema),
    },
    onSubmit: async ({ value }) => {
      const contacts = parseContactsFromFormValue(value, propertyDefinitions);
      onSubmit(contacts);
    },
  });

  const propertyKeySelectItems = useMemo(
    () => [
      { label: "Select property", value: null },
      { label: "Name", value: "name" },
      ...propertyDefinitions.map((d) => ({ label: d.key, value: d.key })),
    ],
    [propertyDefinitions],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          form.handleSubmit();
        }
      }}
    >
      <form.Field name="contactsInput">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field.Root>
              <Field.Label>Contacts (one per line)</Field.Label>
              <Textarea
                ref={initialFocusRef}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={field.handleChange}
                placeholder={`John Doe, john@example.com, +33612345678
Jane Smith, jane@example.com, +33687654321
Bob Wilson, bob@example.com, +33698765432`}
                size="none"
                className="min-h-40"
                aria-invalid={isInvalid}
              />
            </Field.Root>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.contactsInput}>
        {(contactsInput) => {
          const valueExamples = extractValueExamplesFromInput(contactsInput);
          if (!valueExamples) return null;
          return (
            <form.Field name="propertyKeysMapping">
              {(field) => {
                return (
                  <Field.Root className="flex flex-col gap-2">
                    <div
                      className="grid gap-x-2 gap-y-3 text-sm items-center"
                      style={{
                        gridTemplateColumns: "auto auto minmax(10rem, 1fr)",
                      }}
                    >
                      {valueExamples.map((sample, i) => (
                        <>
                          <Badge key={`${i}-sample`} variant="outline">
                            {sample}
                          </Badge>
                          <ArrowRight01Icon
                            key={`${i}-arrow`}
                            className="size-4 text-muted-foreground shrink-0"
                          />
                          <Select.Root
                            key={`${i}-select`}
                            value={field.state.value?.[i] ?? null}
                            onValueChange={(value) =>
                              field.handleChange(
                                Array.from(
                                  { length: valueExamples.length },
                                  (_, idx) =>
                                    idx === i
                                      ? (value ?? null)
                                      : (field.state.value?.[idx] ?? null),
                                ),
                              )
                            }
                            items={propertyKeySelectItems}
                          >
                            <Select.Trigger
                              className="h-8 w-full min-w-0"
                              size="default"
                            >
                              <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                              {propertyKeySelectItems.map((item) => (
                                <Select.Item
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </>
                      ))}
                    </div>
                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <Field.Error errors={field.state.meta.errors} />
                      )}
                  </Field.Root>
                );
              }}
            </form.Field>
          );
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.isSubmitting,
          state.values.contactsInput,
        ]}
      >
        {([canSubmit, isSubmitting, contactsInput]) => {
          const hasContactsInput =
            typeof contactsInput === "string" &&
            contactsInput.trim().length > 0;
          return (
            <Button
              type="submit"
              disabled={Boolean(
                !canSubmit || isSubmitting || !hasContactsInput,
              )}
              className="self-end"
            >
              {isSubmitting ? "Adding…" : "Add contacts"}
              <Kbd.Group>
                <Kbd.Key className="text-gray-1/90 bg-orange-10">⌘</Kbd.Key>
                <Kbd.Key className="text-gray-1/90 bg-orange-10">↩</Kbd.Key>
              </Kbd.Group>
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
};

const extractValueExamplesFromInput = (text: string): string[] | null => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  const lines = trimmed.split("\n").map((l) => l.trim());
  if (lines.length === 0) return null;

  const referenceExamples = lines.reduce((best, line) => {
    const parts = line.split(",").map((p) => p.trim());
    return parts.length > best.length ? parts : best;
  }, [] as string[]);

  return referenceExamples.length === 0 ? null : referenceExamples;
};

const parseContactsFromFormValue = (
  value: {
    contactsInput: string;
    propertyKeysMapping: readonly (string | null)[];
  },
  propertyDefinitions: readonly Pick<
    ContactPropertyDefinitionData,
    "key" | "type"
  >[],
): typeof ContactFormOutputsSchema.Type => {
  const lines = value.contactsInput
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const referenceExamples = extractValueExamplesFromInput(value.contactsInput);
  if (!referenceExamples) return [];

  const keyToType = Object.fromEntries(
    propertyDefinitions.map((d) => [String(d.key), d.type]),
  );
  const contacts: Array<Omit<ContactCreateInput, "workspaceId" | "spaceId">> =
    [];

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    const properties: Record<string, string | number> = {};

    for (let i = 0; i < referenceExamples.length; i++) {
      const key = value.propertyKeysMapping[i];
      if (!key) continue;
      const rawValue = parts[i];
      if (rawValue === undefined) continue;

      const propType = keyToType[key];
      const numValue = Number(rawValue);
      const useNumber =
        propType === "NUMBER" &&
        !Number.isNaN(numValue) &&
        rawValue.trim() !== "";
      properties[key] = useNumber ? numValue : rawValue;
    }

    const name = properties.name;
    contacts.push({
      ...(typeof name === "string" && { name }),
      properties: Object.keys(properties).length > 0 ? properties : undefined,
      segmentIds: [],
    });
  }

  return contacts;
};
