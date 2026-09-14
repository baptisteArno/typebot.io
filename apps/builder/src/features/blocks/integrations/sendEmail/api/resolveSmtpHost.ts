import { isIP } from "node:net";
import { resolveAndValidateHttpReqUrl } from "@typebot.io/lib/ssrf/validateHttpReqUrl";

export const resolveSmtpHost = async (host: string) => {
  const hostname = host.toLowerCase().replace(/\.$/, "");
  const address =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;
  const isIPv6 = isIP(address) === 6;
  if (
    !isIPv6 &&
    (!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/.test(hostname) ||
      hostname === "localhost")
  )
    throw new Error("Invalid SMTP hostname");

  // Reuse the destination policy, without accepting URLs, ports, credentials,
  // encoded IPs or the HTTP development-only localhost exception.
  const url = new URL(`http://${isIPv6 ? `[${address}]` : hostname}`);
  if (!isIPv6 && url.hostname !== hostname)
    throw new Error("Invalid SMTP hostname encoding");
  const { resolvedAddress } = await resolveAndValidateHttpReqUrl(url.href);
  return {
    host: resolvedAddress,
    // Keep certificate verification and SNI bound to the requested DNS name.
    servername: isIP(address) ? undefined : hostname,
  };
};
