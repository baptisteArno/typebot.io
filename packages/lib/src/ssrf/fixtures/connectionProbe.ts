import assert from "node:assert/strict";
import { Agent, request } from "undici";
import { createValidatingLookup } from "../createSafeDispatcher";

// Run in Node: Bun's built-in undici replacement is not the production Agent.
const checkConnections = async () => {
  for (const protocol of ["http", "https"]) {
    for (const address of ["100.100.100.200", "::ffff:6464:64c8"]) {
      let lookupCallCount = 0;
      const dispatcher = new Agent({
        connect: {
          timeout: 1000,
          lookup: createValidatingLookup((_hostname, options, callback) => {
            lookupCallCount++;
            if (options.all)
              callback(null, [
                { address, family: address.includes(":") ? 6 : 4 },
              ]);
            else callback(null, address, address.includes(":") ? 6 : 4);
          }),
        },
      });
      try {
        await assert.rejects(
          request(`${protocol}://public.example`, { dispatcher }),
          /100\.64\.0\.0\/10/,
        );
        assert.equal(lookupCallCount, 1);
      } finally {
        await dispatcher.close();
      }
    }
  }
  console.log("4 connection checks passed");
};

checkConnections().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
