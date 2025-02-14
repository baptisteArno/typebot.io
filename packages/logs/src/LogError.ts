import type { LogInSession } from "./schemas";

export class LogError extends Error {
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

  toToast() {
    return {
      description: this.message,
      context: this.context,
      details: this.details,
    } satisfies LogInSession;
  }
}
