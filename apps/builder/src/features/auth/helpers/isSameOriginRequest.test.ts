import { expect, it } from "bun:test";
import { isSameOriginRequest } from "./isSameOriginRequest";

for (const headers of [
  { "sec-fetch-site": "same-origin" },
  { origin: "https://builder.example.com" },
  { referer: "https://builder.example.com/typebots" },
])
  it(`accepts same-origin evidence ${JSON.stringify(headers)}`, () => {
    expect(
      isSameOriginRequest(new Headers(headers), "https://builder.example.com"),
    ).toBe(true);
  });

for (const headers of [
  {},
  { "sec-fetch-site": "same-site" },
  { "sec-fetch-site": "cross-site", origin: "https://builder.example.com" },
  { "sec-fetch-site": "none" },
  { origin: "https://bot.example.com" },
  { origin: "null", referer: "https://builder.example.com/" },
  { origin: "https://builder.example.com:8443" },
  { origin: "http://builder.example.com" },
  { referer: "https://builder.example.com.attacker.test/" },
  { referer: "invalid" },
])
  it(`rejects untrusted or missing origin evidence ${JSON.stringify(headers)}`, () => {
    expect(
      isSameOriginRequest(new Headers(headers), "https://builder.example.com"),
    ).toBe(false);
  });
