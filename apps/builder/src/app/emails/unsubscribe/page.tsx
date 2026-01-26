import { verifyUnsubscribeToken } from "@typebot.io/user/verifyUnsubscribeToken";
import type { Metadata } from "next";
import { UnsubscribePageClient } from "./UnsubscribePageClient";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "Email preferences",
  icons: {
    icon: "/favicon.svg",
  },
};

const showUnsubscribePage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const email = getSearchParam(resolvedSearchParams, "email");
  const token = getSearchParam(resolvedSearchParams, "token");
  const isValid = Boolean(
    email && token && verifyUnsubscribeToken(email, token),
  );

  return (
    <UnsubscribePageClient email={email} token={token} isValid={isValid} />
  );
};

export default showUnsubscribePage;

const getSearchParam = (
  searchParams: SearchParams | undefined,
  key: string,
) => {
  const value = searchParams?.[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
};
