import { useForm } from "@tanstack/react-form";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { Schema } from "effect";
import type { RefObject } from "react";
import type { SpaceCreateInput } from "../../application/SpaceCreateInput";
import { SpaceCreateInputSchema } from "../../application/SpaceCreateInput";

const SpaceCreateInputStandardSchema = SpaceCreateInputSchema.pipe(
  Schema.toStandardSchemaV1,
);

export const CreateSpaceForm = ({
  onValidSubmit,
  initialFocusRef,
}: {
  onValidSubmit: (input: SpaceCreateInput) => Promise<void>;
  initialFocusRef?: RefObject<HTMLInputElement | null>;
}) => {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: SpaceCreateInputStandardSchema,
    },
    onSubmit: async ({ value }) => {
      await onValidSubmit(Schema.decodeSync(SpaceCreateInputSchema)(value));
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
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
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder="My space"
              />
              {isInvalid && <Field.Error errors={field.state.meta.errors} />}
            </Field.Root>
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
