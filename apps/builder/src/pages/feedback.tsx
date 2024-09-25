import { env } from "@typebot.io/env";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import { sign } from "jsonwebtoken";
import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";

export default function Page() {
  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions({}),
  );
  if (isNotDefined(session?.user))
    return {
      redirect: {
        permanent: false,
        destination: `/signin?redirectPath=%2Ffeedback`,
      },
    };
  const sleekplanToken = createSSOToken(session?.user as Prisma.User);
  return {
    redirect: {
      permanent: false,
      destination: `https://feedback.typebot.io?sso=${sleekplanToken}`,
    },
  };
}

const createSSOToken = (user: Prisma.User) => {
  if (!env.SLEEKPLAN_SSO_KEY) return;
  const userData = {
    mail: user.email,
    id: user.id,
    name: user.name,
    img: user.image,
  };

  return sign(userData, env.SLEEKPLAN_SSO_KEY, { algorithm: "HS256" });
};
