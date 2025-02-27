import { createAuthConfig } from "@/features/auth/helpers/createAuthConfig";
import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";

export default function Page() {
  return null;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerSession(
    context.req,
    context.res,
    createAuthConfig(),
  );
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
  return {
    redirect: {
      permanent: false,
      destination:
        context.locale !== context.defaultLocale
          ? `/${context.locale}/typebots`
          : "/typebots",
    },
  };
};
