import { describe, expect, it } from "bun:test";
import {
  createValidatingLookup,
  validateResolvedAddress,
} from "./createSafeDispatcher";
import { parseIPAddress, validateHttpReqUrl } from "./validateHttpReqUrl";

const blockedAddresses = [
  "100.64.0.0",
  "100.100.100.200",
  "100.127.255.255",
  "192.0.0.0",
  "192.0.0.8",
  "192.0.0.11",
  "192.0.0.170",
  "192.0.0.255",
  "192.0.2.0",
  "192.0.2.255",
  "192.88.99.0",
  "192.88.99.255",
  "198.18.0.0",
  "198.19.255.255",
  "198.51.100.0",
  "198.51.100.255",
  "203.0.113.0",
  "203.0.113.255",
  "224.0.0.0",
  "239.255.255.255",
  "240.0.0.0",
  "255.255.255.255",
  "::ffff:100.100.100.200",
  "::ffff:6464:64c8",
  "0000:0000:0000:0000:0000:ffff:6464:64c8",
  "0:0::ffff:6464:64c8",
  "::ffff:0:100.100.100.200",
  "::100.100.100.200",
  "64:ff9b::6464:64c8",
  "64:ff9b::a01:203",
  "64:ff9b::a9fe:a9fe",
  "64:ff9b::7f00:1",
  "::ffff:c612:1",
  "64:ff9b:1::1",
  "2002:6464:64c8::1",
  "2001:0:4136:e378:8000:63bf:9b9b:9b37",
  "100::1",
  "100:0:0:1::1",
  "2001:2::1",
  "2001::",
  "2001:1::",
  "2001:1::4",
  "2001:1::1:1",
  "2001:1:1::1",
  "2001:2:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:4:111:ffff:ffff:ffff:ffff:ffff",
  "2001:4:113::",
  "2001:10::",
  "2001:1f:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:40::",
  "2001:1ff:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:0010:0000:0000:0000:0000:0000:0001",
  "2001:db8::1",
  "3fff::",
  "3fff:fff:ffff:ffff:ffff:ffff:ffff:ffff",
  "5f00::1",
  "fec0::1",
  "feff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  "ff00::",
  "ff02::1",
  "0:0:0:0:0:0:0:0001",
];

const publicAddresses = [
  "100.63.255.255",
  "100.128.0.0",
  "192.0.0.9",
  "192.0.0.10",
  "192.0.1.255",
  "192.0.3.0",
  "192.88.98.255",
  "192.88.100.0",
  "198.17.255.255",
  "198.20.0.0",
  "198.51.99.255",
  "198.51.101.0",
  "203.0.112.255",
  "203.0.114.0",
  "223.255.255.255",
  "192.31.196.1",
  "192.52.193.1",
  "192.175.48.1",
  "::ffff:8.8.8.8",
  "64:ff9b::808:808",
  "2001:4860:4860::8888",
  "2001:1::1",
  "2001:1::2",
  "2001:1::3",
  "2001:0001:0000:0000:0000:0000:0000:0003",
  "2001:3::",
  "2001:3::1",
  "2001:3:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:4:112::",
  "2001:4:112::1",
  "2001:4:112:ffff:ffff:ffff:ffff:ffff",
  "2001:20::",
  "2001:2f:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:30::",
  "2001:3f:ffff:ffff:ffff:ffff:ffff:ffff",
  "2000:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  "2001:200::",
  "2620:4f:8000::1",
  "3fff:1000::",
  "2606:4700:4700::1111",
];

describe("special address ranges", () => {
  it("rejects special addresses during actual Node/undici connections", async () => {
    const build = await Bun.build({
      entrypoints: [
        new URL("./fixtures/connectionProbe.ts", import.meta.url).pathname,
      ],
      target: "node",
      format: "cjs",
    });
    expect(build.success).toBe(true);
    const subprocess = Bun.spawn(["node", "--input-type=commonjs"], {
      stdin: new Blob([await build.outputs[0].text()]),
      stdout: "pipe",
      stderr: "pipe",
    });
    const [exitCode, stdout, stderr] = await Promise.all([
      subprocess.exited,
      new Response(subprocess.stdout).text(),
      new Response(subprocess.stderr).text(),
    ]);
    expect(exitCode, stderr).toBe(0);
    expect(stdout.trim()).toBe("4 connection checks passed");
  });

  it.each(
    blockedAddresses,
  )("blocks direct and allowlisted literals: %s", async (address) => {
    const hostname = address.includes(":") ? `[${address}]` : address;
    for (const allowedHosts of [
      [],
      [new URL(`http://${hostname}`).hostname.replace(/^\[|\]$/g, "")],
    ])
      await expect(
        validateHttpReqUrl(`http://${hostname}/`, { allowedHosts }),
      ).rejects.toThrow();
  });

  it.each(
    blockedAddresses,
  )("blocks every DNS answer and connection address: %s", async (address) => {
    for (const allowedHosts of [[], ["internal.example"]]) {
      for (const answers of [
        [address, "8.8.8.8"],
        ["8.8.8.8", address],
      ]) {
        await expect(
          validateHttpReqUrl("https://internal.example", {
            allowedHosts,
            lookupHost: async () =>
              answers.map((address) => ({
                address,
                family: address.includes(":") ? 6 : 4,
              })),
          }),
        ).rejects.toThrow();
      }
      expect(() =>
        validateResolvedAddress("internal.example", address, allowedHosts),
      ).toThrow();
    }
  });

  it.each(
    publicAddresses,
  )("preserves public destinations: %s", async (address) => {
    await expect(
      validateHttpReqUrl(
        `https://${address.includes(":") ? `[${address}]` : address}`,
        { allowedHosts: [] },
      ),
    ).resolves.toBeUndefined();
    expect(() =>
      validateResolvedAddress("public.example", address, []),
    ).not.toThrow();
  });

  it.each([
    "1684301000",
    "0x646464c8",
    "0144.0144.0144.0310",
    "100.6579400",
  ])("blocks encoded shared addresses: %s", async (address) => {
    await expect(validateHttpReqUrl(`http://${address}`)).rejects.toThrow(
      "100.64.0.0/10",
    );
  });

  it.each([
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "::ffff:10.1.2.3",
  ])("preserves the exact RFC1918 allowlist contract: %s", async (address) => {
    for (const allowedHosts of [[], ["example"]])
      await expect(
        validateHttpReqUrl("http://internal.example", {
          allowedHosts,
          lookupHost: async () => [
            { address, family: address.includes(":") ? 6 : 4 },
          ],
        }),
      ).rejects.toThrow();
    await expect(
      validateHttpReqUrl("http://internal.example", {
        allowedHosts: ["internal.example"],
        lookupHost: async () => [
          { address, family: address.includes(":") ? 6 : 4 },
        ],
      }),
    ).resolves.toBeUndefined();
  });

  it.each([
    "garbage:ip",
    "::ffff:999.1.1.1",
    "1::2::3",
  ])("rejects malformed DNS addresses: %s", (address) => {
    expect(parseIPAddress(address)).toBeNull();
    expect(() => validateResolvedAddress("public.example", address)).toThrow(
      "invalid IP",
    );
  });

  it("rejects rebinding in both lookup callback modes", async () => {
    for (const all of [false, true]) {
      await expect(
        new Promise((resolve, reject) => {
          createValidatingLookup((_hostname, _options, callback) => {
            if (all)
              callback(null, [
                { address: "8.8.8.8", family: 4 },
                { address: "100.100.100.200", family: 4 },
              ]);
            else callback(null, "100.100.100.200", 4);
          })("public.example", { all }, (error, address) =>
            error ? reject(error) : resolve(address),
          );
        }),
      ).rejects.toThrow("100.64.0.0/10");
    }
  });
});
