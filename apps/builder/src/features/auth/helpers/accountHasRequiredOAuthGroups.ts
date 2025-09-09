import { env } from "@typebot.io/env";
import type { Account } from "next-auth";

export const accountHasRequiredOAuthGroups = async (
  account: Account,
): Promise<boolean> => {
  const requiredGroups = getRequiredGroups(account.provider);
  if (requiredGroups.length === 0) return true;
  switch (account.provider) {
    case "gitlab": {
      return (await getGitlabGroups(account.access_token as string))
        .map((group) => group.full_path)
        ?.some((group) => requiredGroups?.includes(group));
    }
    default:
      return true;
  }
};

export const getRequiredGroups = (provider: string): string[] => {
  switch (provider) {
    case "gitlab":
      return env.GITLAB_REQUIRED_GROUPS ?? [];
    default:
      return [];
  }
};

const getGitlabGroups = async (
  accessToken: string,
  page = 1,
): Promise<{ full_path: string }[]> => {
  const res = await fetch(
    `${
      env.GITLAB_BASE_URL || "https://gitlab.com"
    }/api/v4/groups?per_page=100&page=${page}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const groups: { full_path: string }[] = await res.json();
  const nextPage = Number.parseInt(res.headers.get("X-Next-Page") || "", 10);
  if (nextPage) groups.push(...(await getGitlabGroups(accessToken, nextPage)));
  return groups;
};
