import { auth } from "@/features/auth/lib/nextAuth";
import type { GetServerSidePropsContext } from "next";

export default function Page() {
  return null;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await auth(context);
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
