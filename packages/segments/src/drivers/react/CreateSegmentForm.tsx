import { useForm } from "@tanstack/react-form";
import { Name } from "@typebot.io/domain-primitives/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import type { RefObject } from "react";
import type { SegmentCreateInputSchema } from "../../core/Segment";
import { SegmentCreateInputStandardSchema } from "../../core/Segment";

export const CreateSegmentForm = ({
  onValidSubmit,
  initialFocusRef,
}: {
  onValidSubmit: (input: SegmentCreateInputSchema) => Promise<void>;
  initialFocusRef?: RefObject<HTMLInputElement | null>;
}) => {
  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onSubmit: SegmentCreateInputStandardSchema,
    },
    onSubmit: async ({ value }) => {
      await onValidSubmit({
        ...value,
        name: Name.make(value.name),
      });
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
                onValueChange={field.handleChange}
                aria-invalid={isInvalid}
                placeholder="My segment"
              />
              {isInvalid && <Field.Error errors={field.state.meta.errors} />}
            </Field.Root>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(formState) => formState.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit}>
            Create
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
