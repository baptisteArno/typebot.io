import { lookup as dnsLookup, type LookupOneOptions } from "node:dns";
import type { LookupFunction } from "node:net";
import { Agent } from "undici";
import { parseIPAddress, validateIPAddress } from "./validateHttpReqUrl";

/**
 * A DNS lookup function that validates resolved IPs against SSRF blocklists.
 * Used as the `connect.lookup` in an undici Agent to ensure IP validation
 * happens at connection time — eliminating the TOCTOU gap of DNS rebinding.
 */
export const validatingLookup: LookupFunction = (
  hostname,
  options,
  callback,
) => {
  dnsLookup(
    hostname,
    // LookupFunction always passes LookupOneOptions (never all:true),
    // so the callback receives a single address string, not an array.
    options as LookupOneOptions,
    (err, address, family) => {
      if (err) return callback(err, address, family);
      try {
        const parsed = parseIPAddress(address);
        if (parsed) validateIPAddress(parsed);
      } catch (validationError) {
        return callback(
          validationError instanceof Error
            ? validationError
            : new Error(String(validationError)),
          address,
          family,
        );
      }
      callback(null, address, family);
    },
  );
};

/**
 * Creates an undici Agent that validates resolved IPs at connection time,
 * preventing DNS rebinding attacks.
 *
 * Unlike pre-request URL validation, this ensures the IP check happens
 * during the actual TCP connection — eliminating the TOCTOU gap where
 * a hostname could rebind between validation and connection.
 */
export const createSafeDispatcher = () =>
  new Agent({
    connect: {
      lookup: validatingLookup,
    },
  });

let sharedDispatcher: Agent | undefined;

export const getSafeDispatcher = () => {
  if (!sharedDispatcher) sharedDispatcher = createSafeDispatcher();
  return sharedDispatcher;
};
