import { isIP, type LookupFunction } from "node:net";
import { ProxyAgent } from "undici";
import { validatingLookup } from "./createSafeDispatcher";

type SafeProxyAgentOptions = ProxyAgent.Options & {
  proxyTls: { lookup: LookupFunction };
};

type ProxyAgentFactory = (options: SafeProxyAgentOptions) => ProxyAgent;

export const createSafeProxyAgent = (
  {
    proxyUrl,
    targetHostname,
    proxyLookup = validatingLookup,
  }: {
    proxyUrl: string;
    targetHostname: string;
    proxyLookup?: LookupFunction;
  },
  proxyAgentFactory: ProxyAgentFactory = (options) => new ProxyAgent(options),
) =>
  proxyAgentFactory({
    uri: proxyUrl,
    proxyTls: { lookup: proxyLookup },
    ...(isIP(targetHostname) === 0
      ? { requestTls: { servername: targetHostname } }
      : {}),
  });
