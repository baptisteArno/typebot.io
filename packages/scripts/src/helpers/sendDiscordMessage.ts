import ky from "ky";

const DISCORD_LIMIT = 2000;
const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function sendDiscordMessage(
  message: string | string[],
  options: { channelId: string },
): Promise<void> {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error("DISCORD_BOT_TOKEN is not set");
  }

  const messages = Array.isArray(message) ? message : [message];

  for (const message of messages) {
    const chunks = splitForDiscord(message, DISCORD_LIMIT);
    for (const chunk of chunks) {
      await sendMessageToChannel(
        options.channelId,
        chunk,
        process.env.DISCORD_BOT_TOKEN,
      );
    }
  }
}

/**
 * Sends a message to a Discord channel using the HTTP API
 */
async function sendMessageToChannel(
  channelId: string,
  content: string,
  token: string,
): Promise<void> {
  const url = `${DISCORD_API_BASE}/channels/${channelId}/messages`;

  const response = await ky.post(url, {
    headers: {
      Authorization: `Bot ${token}`,
    },
    json: {
      content,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send Discord message: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }
}

/**
 * Splits text into <= maxLen chunks, preferring clean breakpoints and
 * preserving triple-backtick code fences across chunks.
 */
function splitForDiscord(text: string, maxLen = DISCORD_LIMIT): string[] {
  const parts: string[] = [];

  // Track if we’re inside a fenced code block and the language used.
  let openFenceLang: string | null = null;

  const pushChunk = (chunk: string) => {
    // Count fences in this chunk to see if we toggle open/close
    const fenceMatches = [...chunk.matchAll(/```(\w+)?/g)];
    if (fenceMatches.length % 2 !== 0) {
      // Unbalanced fences in this chunk
      if (openFenceLang === null) {
        // We just opened a fence; remember its language and close it for this chunk
        const last = fenceMatches[fenceMatches.length - 1];
        openFenceLang = last[1] ?? null;
        chunk += "\n```"; // close fence
      } else {
        // We were already inside a fence and this chunk closes it
        openFenceLang = null;
      }
    }

    parts.push(chunk);

    // If we remain inside a fence, prefix next chunk with reopening fence
    if (openFenceLang !== null) {
      parts.push("```" + (openFenceLang ?? "") + "\n"); // temporary marker; will be merged with next content
    }
  };

  let remaining = text;

  while (remaining.length > maxLen) {
    const cut = findCutIndex(remaining, maxLen);
    const chunk = remaining.slice(0, cut);
    remaining = remaining.slice(cut).replace(/^\s+/, ""); // trim start

    pushChunk(chunk);
    // If we inserted a reopening fence marker, merge it with the start of remaining text
    if (parts.length && parts[parts.length - 1].startsWith("```")) {
      const reopen = parts.pop()!; // remove marker
      remaining = reopen + remaining;
    }
  }

  if (remaining.length) pushChunk(remaining);

  return parts;
}

/**
 * Prefer cutting at paragraph, then line, then space boundaries before maxLen.
 * Falls back to a hard cut at maxLen if needed.
 */
function findCutIndex(s: string, maxLen: number): number {
  if (s.length <= maxLen) return s.length;

  const preferred = ["\n\n", "\n", " "];
  for (const sep of preferred) {
    const idx = s.lastIndexOf(sep, maxLen);
    if (idx !== -1 && idx > 0) {
      return idx + sep.length; // include the separator
    }
  }
  return maxLen;
}
