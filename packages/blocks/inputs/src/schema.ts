import { z } from "@typebot.io/zod";
import { buttonsInputSchemas } from "./choice/schema";
import { dateInputSchema } from "./date/schema";
import { emailInputSchema } from "./email/schema";
import { fileInputBlockSchemas } from "./file/schema";
import { numberInputSchema } from "./number/schema";
import { paymentInputSchema } from "./payment/schema";
import { phoneNumberInputBlockSchema } from "./phone/schema";
import { pictureChoiceBlockSchemas } from "./pictureChoice/schema";
import { ratingInputBlockSchema } from "./rating/schema";
import { textInputSchema } from "./text/schema";
import { urlInputSchema } from "./url/schema";

const inputBlockSchemas = [
  textInputSchema,
  emailInputSchema,
  numberInputSchema,
  urlInputSchema,
  phoneNumberInputBlockSchema,
  dateInputSchema,
  paymentInputSchema,
  ratingInputBlockSchema,
] as const;

export const inputBlockV5Schema = z.discriminatedUnion("type", [
  ...inputBlockSchemas,
  buttonsInputSchemas.v5,
  fileInputBlockSchemas.v5,
  pictureChoiceBlockSchemas.v5,
]);
export type InputBlockV5 = z.infer<typeof inputBlockV5Schema>;

export const inputBlockV6Schema = z.discriminatedUnion("type", [
  ...inputBlockSchemas,
  buttonsInputSchemas.v6,
  fileInputBlockSchemas.v6,
  pictureChoiceBlockSchemas.v6,
]);
export type InputBlockV6 = z.infer<typeof inputBlockV6Schema>;

export type InputBlock = InputBlockV5 | InputBlockV6;
