import type { IncomingMessage } from "http";
import { ErrorPage } from "@/components/ErrorPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import { RootPage } from "@/components/RootPage";
import {
  type TypebotPageProps,
  TypebotPageV2,
} from "@/components/TypebotPageV2";
import {
  TypebotPageV3,
  type TypebotV3PageProps,
} from "@/components/TypebotPageV3";
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
import type { GetServerSideProps, GetServerSidePropsContext } from "next";

// Browsers that doesn't support ES modules and/or web components
const incompatibleBrowsers = [
  {
    name: "UC Browser",
    regex: /ucbrowser/i,
  },
  {
    name: "Internet Explorer",
    regex: /msie|trident/i,
  },
  {
    name: "Opera Mini",
    regex: /opera mini/i,
  },
];

const log = (message: string) => {
  if (!env.DEBUG) return;
  console.log(`[DEBUG] ${message}`);
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const incompatibleBrowser =
    incompatibleBrowsers.find((browser) =>
      browser.regex.test(context.req.headers["user-agent"] ?? ""),
    )?.name ?? null;
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
    const isMatchingViewerUrl = env.NEXT_PUBLIC_E2E_TEST
      ? true
      : viewerUrls.some(
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
    const publishedTypebot = isMatchingViewerUrl
      ? await getTypebotFromPublicId(context.query.publicId?.toString())
      : await getTypebotFromCustomDomain(customDomain);

    if (!publishedTypebot || publishedTypebot?.isSuspended)
      return {
        notFound: true,
      };

    return {
      props: {
        publishedTypebot,
        incompatibleBrowser,
        isMatchingViewerUrl,
        url: `${protocol}://${forwardedHost ?? host}${pathname}`,
      },
    };
  } catch (err) {
    console.error(err);
  }
  return {
    props: {
      incompatibleBrowser,
      url: `${protocol}://${forwardedHost ?? host}${pathname}`,
    },
  };
};

const getTypebotFromPublicId = async (publicId?: string) => {
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
  if (isNotDefined(publishedTypebot)) return null;
  const theme = themeSchema.parse(publishedTypebot.theme);
  const settings = settingsSchema.parse(publishedTypebot.settings);
  return publishedTypebot.version
    ? {
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
        version: publishedTypebot.version,
        isSuspended: publishedTypebot.typebot.workspace.isSuspended,
      }
    : {
        ...publishedTypebot,
        isSuspended: publishedTypebot.typebot.workspace.isSuspended,
      };
};

const getTypebotFromCustomDomain = async (customDomain: string) => {
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
  if (isNotDefined(publishedTypebot)) return null;
  const theme = themeSchema.parse(publishedTypebot.theme);
  const settings = settingsSchema.parse(publishedTypebot.settings);
  return publishedTypebot.version
    ? {
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
        version: publishedTypebot.version,
        isSuspended: publishedTypebot.typebot.workspace.isSuspended,
      }
    : {
        ...publishedTypebot,
        isSuspended: publishedTypebot.typebot.workspace.isSuspended,
      };
};

const getHost = (
  req?: IncomingMessage,
): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers["x-forwarded-host"] as string | undefined,
});

const App = ({
  publishedTypebot,
  incompatibleBrowser,
  dashboardUrl,
  ...props
}: {
  isIE: boolean;
  customHeadCode: string | null;
  url: string;
  isMatchingViewerUrl?: boolean;
  dashboardUrl?: string;
  publishedTypebot:
    | TypebotPageProps["publishedTypebot"]
    | (Pick<
        TypebotV3PageProps,
        | "name"
        | "publicId"
        | "background"
        | "isHideQueryParamsEnabled"
        | "metadata"
        | "font"
      > & {
        version: PublicTypebot["version"];
      });
  incompatibleBrowser: string | null;
}) => {
  if (incompatibleBrowser)
    return (
      <ErrorPage
        error={
          new Error(
            `Your web browser: ${incompatibleBrowser}, is not supported.`,
          )
        }
      />
    );
  if (dashboardUrl) return <RootPage dashboardUrl={dashboardUrl} />;
  if (
    !publishedTypebot ||
    ("typebot" in publishedTypebot && publishedTypebot.typebot.isArchived)
  )
    return <NotFoundPage />;
  if ("typebot" in publishedTypebot && publishedTypebot.typebot.isClosed)
    return <ErrorPage error={new Error("This bot is now closed")} />;
  return "typebot" in publishedTypebot ? (
    <TypebotPageV2 publishedTypebot={publishedTypebot} {...props} />
  ) : (
    <TypebotPageV3
      url={props.url}
      isMatchingViewerUrl={props.isMatchingViewerUrl}
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
