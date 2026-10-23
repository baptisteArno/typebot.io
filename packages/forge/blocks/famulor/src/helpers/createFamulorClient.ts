import { safeKy } from "@typebot.io/lib/ky";
import { famulorMaxPages, famulorPageSize } from "../constants";
import type { FamulorList } from "../types";
import { resolveFamulorApiBaseUrl } from "./resolveFamulorApiBaseUrl";

export const createFamulorClient = ({
  apiKey,
  baseUrl,
}: {
  apiKey: string;
  baseUrl?: string;
}) => {
  const resolved = resolveFamulorApiBaseUrl(baseUrl);
  if (!resolved.ok) return resolved;

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const get = <T>(path: string, searchParams?: Record<string, number>) =>
    safeKy
      .get(`${resolved.apiBaseUrl}${path}`, { headers, searchParams })
      .json<T>();

  const post = <T>(path: string, json: Record<string, unknown>) =>
    safeKy.post(`${resolved.apiBaseUrl}${path}`, { headers, json }).json<T>();

  const listAll = async <T>(path: string) => {
    const items: T[] = [];
    for (let page = 0; page < famulorMaxPages; page++) {
      const offset = page * famulorPageSize;
      const response = await get<FamulorList<T>>(path, {
        limit: famulorPageSize,
        offset,
      });
      const pageItems = response.data ?? [];
      items.push(...pageItems);
      const total = response.meta?.pagination?.total;
      if (pageItems.length < famulorPageSize) break;
      if (total !== undefined && items.length >= total) break;
    }
    return items;
  };

  return {
    ok: true as const,
    apiBaseUrl: resolved.apiBaseUrl,
    get,
    post,
    listAll,
  };
};
