import { extractSecretReferences } from "./extractSecretReferences";

export class SecretReferenceNotAllowedError extends Error {
  constructor(
    public readonly context: string,
    public readonly references: string[],
  ) {
    super(
      `Workspace secret references are not allowed in ${context}: ${references
        .map((r) => `{{$secrets.${r}}}`)
        .join(", ")}`,
    );
    this.name = "SecretReferenceNotAllowedError";
  }
}

export const assertNoSecretReferences = ({
  input,
  context,
}: {
  input: string;
  context: string;
}): void => {
  const refs = extractSecretReferences(input);
  if (refs.length > 0) throw new SecretReferenceNotAllowedError(context, refs);
};
