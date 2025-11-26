import { env } from "@typebot.io/env";
import { isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { defaultSettings } from "@typebot.io/settings/constants";
import { settingsSchema } from "@typebot.io/settings/schemas";
import {
  defaultBackgroundColor,
  defaultBackgroundType,
} from "@typebot.io/theme/constants";
import { themeSchema } from "@typebot.io/theme/schemas";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { IncomingMessage } from "http";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ErrorPage } from "@/components/ErrorPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import { RootPage } from "@/components/RootPage";
import {
  TypebotPageV3,
  type TypebotV3PageProps,
} from "@/components/TypebotPageV3";

const log = (message: string) => {
  if (!env.DEBUG) return;
  console.log(`[DEBUG] ${message}`);
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const pathname = context.resolvedUrl.split("?")[0];
  const { host, forwardedHost } = getHost(context.req);
  log(`host: ${host}`);
  log(`forwardedHost: ${forwardedHost}`);
  const protocol =
    context.req.headers["x-forwarded-proto"] === "https" ||
    (context.req.socket as unknown as { encrypted: boolean }).encrypted
      ? "https"
      : "http";

  log(`Request protocol: ${protocol}`);
  try {
    if (!host) return { props: {} };
    const viewerUrls = env.NEXT_PUBLIC_VIEWER_URL;
    log(`viewerUrls: ${viewerUrls}`);
    const isMatchingViewerUrl = viewerUrls.some(
      (url) =>
        host.split(":")[0].includes(url.split("//")[1].split(":")[0]) ||
        (forwardedHost &&
          forwardedHost
            .split(":")[0]
            .includes(url.split("//")[1].split(":")[0])),
    );
    log(`isMatchingViewerUrl: ${isMatchingViewerUrl}`);
    if (isMatchingViewerUrl && pathname === "/") {
      // Early return, will just show a root page
      return {
        props: {
          dashboardUrl: `${env.NEXTAUTH_URL ?? "https://app.typebot.io"}/typebots`,
        },
      };
    }
    const customDomain = `${forwardedHost ?? host}${
      pathname === "/" ? "" : pathname
    }`;
    const getTypebotResponse = isMatchingViewerUrl
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(customDomain);

    if (
      (getTypebotResponse.status === "error" &&
        getTypebotResponse.error.code === "NOT_FOUND") ||
      (getTypebotResponse.status === "success" &&
        getTypebotResponse.publishedTypebot.isSuspended)
    )
      return {
        notFound: true,
      };

    return {
      props: {
        errorCode:
          getTypebotResponse.status === "error"
            ? getTypebotResponse.error.code
            : null,
        publishedTypebot:
          getTypebotResponse.status === "success"
            ? getTypebotResponse.publishedTypebot
            : null,
        isMatchingViewerUrl,
        url: `${protocol}://${forwardedHost ?? host}${pathname}`,
      },
    };
  } catch (err) {
    console.error(err);
  }
  return {
    props: {
      url: `${protocol}://${forwardedHost ?? host}${pathname}`,
    },
  };
};

type GetTypebotResponse =
  | {
      status: "error";
      error: {
        code: "OUTDATED" | "NOT_FOUND";
      };
    }
  | {
      status: "success";
      publishedTypebot: ClientPublishedTypebot & { isSuspended: boolean };
    };

const getTypebotFromPublicId = async (
  publicId?: string,
): Promise<GetTypebotResponse> => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { publicId: publicId ?? "" } },
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
  if (isNotDefined(publishedTypebot))
    return {
      status: "error",
      error: {
        code: "NOT_FOUND",
      },
    };
  const theme = themeSchema.parse(publishedTypebot.theme);
  const settings = settingsSchema.parse(publishedTypebot.settings);
  if (!publishedTypebot.version)
    return {
      status: "error",
      error: {
        code: "OUTDATED",
      },
    };
  return {
    status: "success",
    publishedTypebot: {
      name: publishedTypebot.typebot.name,
      publicId: publishedTypebot.typebot.publicId ?? null,
      background: theme.general?.background ?? {
        type: defaultBackgroundType,
        content: isTypebotVersionAtLeastV6(publishedTypebot.version)
          ? defaultBackgroundColor[publishedTypebot.version]
          : defaultBackgroundColor["6"],
      },
      isHideQueryParamsEnabled:
        settings.general?.isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled,
      metadata: settings.metadata ?? {},
      font: theme.general?.font ?? null,
      version: publishedTypebot.version as PublicTypebot["version"],
      isSuspended: publishedTypebot.typebot.workspace.isSuspended,
    },
  };
};

const getTypebotFromCustomDomain = async (
  customDomain: string,
): Promise<GetTypebotResponse> => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { customDomain } },
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
  if (isNotDefined(publishedTypebot))
    return {
      status: "error",
      error: {
        code: "NOT_FOUND",
      },
    };
  if (!publishedTypebot.version)
    return {
      status: "error",
      error: {
        code: "OUTDATED",
      },
    };
  const theme = themeSchema.parse(publishedTypebot.theme);
  const settings = settingsSchema.parse(publishedTypebot.settings);
  return {
    status: "success",
    publishedTypebot: {
      name: publishedTypebot.typebot.name,
      publicId: publishedTypebot.typebot.publicId ?? null,
      background: theme.general?.background ?? {
        type: defaultBackgroundType,
        content: isTypebotVersionAtLeastV6(publishedTypebot.version)
          ? defaultBackgroundColor[publishedTypebot.version]
          : defaultBackgroundColor["6"],
      },
      isHideQueryParamsEnabled:
        settings.general?.isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled,
      metadata: settings.metadata ?? {},
      font: theme.general?.font ?? null,
      version: publishedTypebot.version as PublicTypebot["version"],
      isSuspended: publishedTypebot.typebot.workspace.isSuspended,
    },
  };
};

const getHost = (
  req?: IncomingMessage,
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers["x-forwarded-host"] as string | undefined,
});

type ClientPublishedTypebot = Pick<
  TypebotV3PageProps,
  | "name"
  | "publicId"
  | "background"
  | "isHideQueryParamsEnabled"
  | "metadata"
  | "font"
> & {
  version: PublicTypebot["version"];
};

const App = ({
  errorCode,
  publishedTypebot,
  dashboardUrl,
  url,
  isMatchingViewerUrl,
}: {
  url: string;
  isMatchingViewerUrl?: boolean;
  dashboardUrl?: string;
  publishedTypebot: ClientPublishedTypebot | null;
  errorCode: "OUTDATED" | "NOT_FOUND" | null;
}) => {
  if (dashboardUrl) return <RootPage dashboardUrl={dashboardUrl} />;
  if (errorCode)
    return (
      <ErrorPage
        error={
          errorCode === "OUTDATED"
            ? new Error(
                "This bot is outdated. Please contact the administrator.",
              )
            : new Error("The typebot was not found")
        }
      />
    );
  if (!publishedTypebot) return <NotFoundPage />;
  return (
    <TypebotPageV3
      url={url}
      isMatchingViewerUrl={isMatchingViewerUrl}
      name={publishedTypebot.name}
      publicId={publishedTypebot.publicId}
      isHideQueryParamsEnabled={
        publishedTypebot.isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled
      }
      background={
        publishedTypebot.background ?? {
          type: defaultBackgroundType,
          content: isTypebotVersionAtLeastV6(publishedTypebot.version)
            ? defaultBackgroundColor[publishedTypebot.version]
            : defaultBackgroundColor["6"],
        }
      }
      metadata={publishedTypebot.metadata ?? {}}
      font={publishedTypebot.font}
    />
  );
};

export default App;
