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
import {
  type LocaleDetectionConfig,
  type LocaleDetectionContext,
  detectLocaleServer,
  localizationService,
  supportedLocales,
} from "@typebot.io/lib/localization";
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

// Utility to remove undefined values from objects for JSON serialization
const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((item) => item !== null);
  }

  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefined(value);
        // Only add non-null values, except for specific structure preservation
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        } else if (key === "localizations") {
          // Keep empty localizations as empty object instead of null
          cleaned[key] = {};
        }
      }
    }
    return cleaned;
  }

  return obj;
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

    // Detect locale if localization is enabled
    let detectedLocale = publishedTypebot.defaultLocale || "en";
    const availableLocales = Array.isArray(publishedTypebot.supportedLocales)
      ? publishedTypebot.supportedLocales
      : JSON.parse((publishedTypebot.supportedLocales as string) || '["en"]');
    let localeDetectionMeta = null;

    const localeDetectionConfig =
      typeof publishedTypebot.localeDetectionConfig === "string"
        ? JSON.parse((publishedTypebot.localeDetectionConfig as string) || "{}")
        : publishedTypebot.localeDetectionConfig || {};

    log(`Locale detection config: ${JSON.stringify(localeDetectionConfig)}`);
    log(`Available locales: ${JSON.stringify(availableLocales)}`);
    log(`Default locale: ${publishedTypebot.defaultLocale || "en"}`);
    log(`Query parameters: ${JSON.stringify(context.query)}`);

    // Always check for URL parameters first, even if localization is not fully configured
    const detectionContext: LocaleDetectionContext = {
      headers: context.req.headers as Record<string, string>,
      query: context.query as Record<string, string | string[]>,
      pathname,
      hostname: host,
    };

    // Check for explicit locale URL parameter first
    const urlParamName = localeDetectionConfig.urlParamName || "locale";
    const urlLocaleParam = context.query[urlParamName];
    const urlLocaleValue = Array.isArray(urlLocaleParam)
      ? urlLocaleParam[0]
      : urlLocaleParam;

    if (urlLocaleValue && typeof urlLocaleValue === "string") {
      log(`URL locale parameter found: ${urlLocaleValue}`);
      // Validate that the locale is supported
      if (supportedLocales.includes(urlLocaleValue as any)) {
        detectedLocale = urlLocaleValue;
        localeDetectionMeta = {
          method: "url-param",
          confidence: 1.0,
          fallbackUsed: false,
        };
        log(`Locale set to: ${detectedLocale} via URL parameter`);
      } else {
        log(`Unsupported locale in URL parameter: ${urlLocaleValue}`);
      }
    }

    // If no URL parameter override and localization is properly configured, run full detection
    if (
      !urlLocaleValue &&
      localeDetectionConfig.enabled &&
      availableLocales.length > 1
    ) {
      const detectionResult = detectLocaleServer(
        detectionContext,
        localeDetectionConfig,
      );
      detectedLocale = detectionResult.locale;
      localeDetectionMeta = {
        method: detectionResult.method,
        confidence: detectionResult.confidence,
        fallbackUsed: detectionResult.fallbackUsed,
      };
      log(
        `Locale detected via configured method: ${detectedLocale} (${detectionResult.method})`,
      );
    }

    // Always attempt to resolve localized content if we have a detected locale
    let localizedTypebot = publishedTypebot;
    if (detectedLocale && detectedLocale !== "en") {
      log(`Resolving localized content for locale: ${detectedLocale}`);
      log(`Default locale: ${publishedTypebot.defaultLocale || "en"}`);

      // Debug: Check what localization data exists
      const groups = Array.isArray(publishedTypebot.groups)
        ? publishedTypebot.groups
        : JSON.parse((publishedTypebot.groups as string) || "[]");

      if (groups && groups.length > 0) {
        const firstGroup = groups[0];
        if (firstGroup.blocks && firstGroup.blocks.length > 0) {
          const firstBlock = firstGroup.blocks[0];
          log(`First block type: ${firstBlock.type}`);
          log(
            `First block content: ${JSON.stringify(firstBlock.content, null, 2)}`,
          );
          if (firstBlock.content?.localizations) {
            log(
              `Available localizations: ${Object.keys(firstBlock.content.localizations)}`,
            );
            log(
              `French localization: ${JSON.stringify(firstBlock.content.localizations.fr, null, 2)}`,
            );
          } else {
            log(`No localizations found in first block`);
            // For testing: Create sample French translations if debug mode and no translations exist
            if (
              env.DEBUG &&
              detectedLocale === "fr" &&
              firstBlock.content &&
              firstBlock.type === "text"
            ) {
              log(`Creating test French translation for debugging`);
              if (!firstBlock.content.localizations) {
                firstBlock.content.localizations = {};
              }
              firstBlock.content.localizations.fr = {
                plainText: `[TEST FR] ${firstBlock.content.plainText || firstBlock.content.html || "Hello"}`,
                html: `[TEST FR] ${firstBlock.content.html || firstBlock.content.plainText || "Hello"}`,
              };
              log(
                `Test French translation created: ${JSON.stringify(firstBlock.content.localizations.fr, null, 2)}`,
              );
            }
          }
        }
      }

      try {
        const resolvedContent = localizationService.resolveTypebotContent(
          { groups: groups },
          detectedLocale,
          publishedTypebot.defaultLocale || "en",
        );
        localizedTypebot = {
          ...publishedTypebot,
          groups: resolvedContent.groups,
        };

        // Debug: Check what was resolved
        if (resolvedContent.groups && resolvedContent.groups.length > 0) {
          const firstResolvedGroup = resolvedContent.groups[0];
          if (
            firstResolvedGroup.blocks &&
            firstResolvedGroup.blocks.length > 0
          ) {
            const firstResolvedBlock = firstResolvedGroup.blocks[0];
            log(
              `Resolved block content: ${JSON.stringify(firstResolvedBlock.content, null, 2)}`,
            );
            log(
              `Resolved block has localizations: ${!!firstResolvedBlock.content?.localizations}`,
            );
            if (firstResolvedBlock.content?.plainText) {
              log(
                `Resolved plainText: "${firstResolvedBlock.content.plainText}"`,
              );
            }
            if (firstResolvedBlock.content?.html) {
              log(`Resolved html: "${firstResolvedBlock.content.html}"`);
            }
            if (firstResolvedBlock.content?.richText) {
              log(
                `Resolved richText: ${JSON.stringify(firstResolvedBlock.content.richText, null, 2)}`,
              );
            }
          }
        }

        log(`Localized content resolved successfully for ${detectedLocale}`);
      } catch (error) {
        log(`Failed to resolve localized content: ${error}`);
        // Fallback to original typebot if localization fails
        localizedTypebot = publishedTypebot;
      }
    }

    return {
      props: {
        publishedTypebot: removeUndefined(localizedTypebot),
        incompatibleBrowser,
        isMatchingViewerUrl,
        url: `${protocol}://${forwardedHost ?? host}${pathname}`,
        locale: detectedLocale,
        availableLocales,
        localeDetectionMeta: removeUndefined(localeDetectionMeta),
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
      defaultLocale: true,
      supportedLocales: true,
      localeDetectionConfig: true,
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
        groups: publishedTypebot.groups,
        defaultLocale: publishedTypebot.defaultLocale,
        supportedLocales: publishedTypebot.supportedLocales,
        localeDetectionConfig: publishedTypebot.localeDetectionConfig,
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
      defaultLocale: true,
      supportedLocales: true,
      localeDetectionConfig: true,
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
        groups: publishedTypebot.groups,
        defaultLocale: publishedTypebot.defaultLocale,
        supportedLocales: publishedTypebot.supportedLocales,
        localeDetectionConfig: publishedTypebot.localeDetectionConfig,
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
  locale,
  availableLocales,
  localeDetectionMeta,
  ...props
}: {
  isIE: boolean;
  customHeadCode: string | null;
  url: string;
  isMatchingViewerUrl?: boolean;
  dashboardUrl?: string;
  locale?: string;
  availableLocales?: string[];
  localeDetectionMeta?: any;
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
      locale={locale}
      availableLocales={availableLocales}
      localeDetectionMeta={localeDetectionMeta}
      typebotData={publishedTypebot}
    />
  );
};

export default App;
