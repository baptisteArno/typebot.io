import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";

// If thrown on the server, can be correctly parsed in a client error toast
export class ClientToastError extends Error {
  context?: string;
  details?: string;

  constructor({
    description,
    context,
    details,
  }: {
    description: string;
    context?: string;
    details?: string;
  }) {
    super(description);
    this.context = context;
    this.details = details;
  }

  static async fromUnkownError(err: unknown) {
    return new ClientToastError(await parseUnknownError({ err }));
  }

  toToast() {
    return {
      description: this.message,
      context: this.context,
      details: this.details,
    };
  }
}
