import { useForm } from "@tanstack/react-form";
import type { Segment } from "@typebot.io/segments/core";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { Select } from "@typebot.io/ui/components/Select";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { Schema } from "effect";
import type { RefObject } from "react";

export const FormSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.nonEmptyString()),
  templateId: Schema.String.pipe(Schema.nonEmptyString()),
  credentialsId: Schema.String.pipe(Schema.nonEmptyString()),
  segmentId: Schema.NullOr(Schema.String.pipe(Schema.nonEmptyString())),
  templateAttributesMapping: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.String.pipe(Schema.nonEmptyString()),
    }),
  ),
});
export type Form = typeof FormSchema.Type;
const FormSchemaStandardSchema = FormSchema.pipe(Schema.standardSchemaV1);

type Props = {
  segments: readonly Segment[];
  onValidSubmit: (input: Form) => Promise<void>;
  initialFocusRef?: RefObject<HTMLInputElement | null>;
  className?: string;
};

export const CreateWhatsAppCampaignForm = ({
  segments,
  onValidSubmit,
  initialFocusRef,
  className,
}: Props) => {
  const form = useForm({
    defaultValues: {
      name: "",
      templateId: "",
      credentialsId: "",
    } as Form,
    validators: {
      onSubmit: FormSchemaStandardSchema,
    },
    onSubmit: async ({ value }) => {
      await onValidSubmit(value);
    },
  });

  return (
    <form
      className={cn("flex flex-col gap-4 flex-1", className)}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input
                ref={initialFocusRef}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="My audience"
              />
              {isInvalid && <Field.Error errors={field.state.meta.errors} />}
            </Field.Root>
          );
        }}
      </form.Field>
      <form.Field name="segmentId">
        {(field) => {
          return (
            <div className="flex gap-2">
              <Select.Root
                id={field.name}
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
                items={[
                  { label: "All contacts", value: null as string | null },
                ].concat(
                  segments.map((segment) => ({
                    label: segment.name,
                    value: segment.id,
                  })),
                )}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value={null}>All contacts</Select.Item>
                    {segments.map((segment) => (
                      <Select.Item key={segment.id} value={segment.id}>
                        {segment.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              <Button variant="secondary">
                <Settings01Icon />
                Manage segments
              </Button>
            </div>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(formState) => formState.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit}>
            Submit
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
