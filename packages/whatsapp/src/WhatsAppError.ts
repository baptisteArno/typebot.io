type Details = {
  [key: string]: unknown;
};

export class WhatsAppError extends Error {
  override message: string;
  details?: Details;

  constructor(message: string, details?: Details) {
    super(message);
    this.message = message;
    this.details = details;
  }
}
