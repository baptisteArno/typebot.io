type Details = {
  [key: string]: unknown;
};

export class WhatsAppError extends Error {
  message: string;
  details?: Details;

  constructor(message: string, details?: Details) {
    super();
    this.message = message;
    this.details = details;
  }
}
