import { isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { ErrorPage } from "@/components/ErrorPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import {
  type TypebotPageProps,
  TypebotPageV2,
} from "@/components/TypebotPageV2";

type AppProps = {
  url: string;
  publishedTypebot: TypebotPageProps["publishedTypebot"] | null;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AppProps>> => {
  const publicId = context.params?.publicId as string;
  const publishedTypebot = await getTypebotFromPublicId(publicId);
  return {
    props: {
      publishedTypebot: publishedTypebot as any,
      url: context.resolvedUrl,
    },
  };
};

const getTypebotFromPublicId = async (publicId: string) => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { publicId } },
    select: {
      variables: true,
      settings: true,
      theme: true,
      version: true,
      groups: true,
      edges: true,
      typebotId: true,
      id: true,
      typebot: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
          workspace: {
            select: {
              isSuspended: true,
            },
          },
        },
      },
    },
  });
  if (isNotDefined(publishedTypebot)) return null;
  return {
    ...publishedTypebot,
    isSuspended: publishedTypebot.typebot.workspace.isSuspended,
  };
};

const App = ({ publishedTypebot, url }: AppProps) => {
  if (!publishedTypebot || publishedTypebot.typebot.isArchived)
    return <NotFoundPage />;
  if (publishedTypebot.typebot.isClosed)
    return <ErrorPage error={new Error("This bot is now closed")} />;
  return <TypebotPageV2 publishedTypebot={publishedTypebot} url={url} />;
};

export default App;
