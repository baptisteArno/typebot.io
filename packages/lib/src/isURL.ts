import { type IsURLOptions, isURL } from "validator";

const customIsURL = (val: string, options?: IsURLOptions) =>
  isURL(val, {
    protocols: ["https", "http"],
    require_protocol: true,
    ...options,
  });

export { customIsURL as isURL };
