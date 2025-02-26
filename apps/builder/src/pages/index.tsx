import type { User } from "@typebot.io/schemas/features/user/schema";
import type { GetServerSidePropsContext } from "next";
import { type Session, getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";

export default function Page() {
  return null;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = (await getServerSession(
    context.req,
    context.res,
    getAuthOptions({}),
  )) as Session & { user: User };
  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination:
          context.locale !== context.defaultLocale
            ? `/${context.locale}/signin`
            : "/signin",
      },
    };
  }

  const preferredLanguagePath =
    session?.user?.preferredLanguage &&
    session.user.preferredLanguage !== context.defaultLocale
      ? session.user.preferredLanguage
      : context.locale !== context.defaultLocale
        ? context.locale
        : undefined;

  return {
    redirect: {
      permanent: false,
      destination: preferredLanguagePath
        ? `/${preferredLanguagePath}/typebots`
        : "/typebots",
    },
  };
};
