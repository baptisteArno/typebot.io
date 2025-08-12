import { Bubble, Standard } from "@typebot.io/react";
import { defaultSettings } from "@typebot.io/settings/constants";
import { BackgroundType } from "@typebot.io/theme/constants";
import type { Font } from "@typebot.io/theme/schemas";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { SEO } from "./Seo";

export type TypebotV3PageProps = {
  url: string;
  isMatchingViewerUrl?: boolean;
  name: string;
  publicId: string | null;
  font: Font | null;
  isHideQueryParamsEnabled: boolean | null;
  background: NonNullable<Typebot["theme"]["general"]>["background"];
  metadata: Typebot["settings"]["metadata"];
  locale?: string;
  availableLocales?: string[];
  localeDetectionMeta?: any;
  typebotData?: any; // Localized typebot data to pass to the chat component
};

export const TypebotPageV3 = ({
  font,
  isMatchingViewerUrl,
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
  locale,
  availableLocales,
  localeDetectionMeta,
  typebotData,
}: TypebotV3PageProps) => {
  const { asPath, push } = useRouter();

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes("?");
    if (
      !hasQueryParams ||
      !(
        isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled
      )
    )
      return;
    push(asPath.split("?")[0], undefined, { shallow: true });
  };

  const apiOrigin = useMemo(() => {
    if (isMatchingViewerUrl) return;
    return new URL(url).origin;
  }, [isMatchingViewerUrl, url]);

  // Transform typebotData to match StartTypebot interface if needed
  const formattedTypebotData = useMemo(() => {
    if (!typebotData || typeof typebotData === "string") return typebotData;

    // Ensure the typebot data has the structure expected by the Standard component
    const formatted = {
      version: typebotData.version,
      id: typebotData.id || typebotData.typebotId,
      groups: typebotData.groups,
      events: typebotData.events || [],
      edges: typebotData.edges || [],
      variables: typebotData.variables || [],
      settings: typebotData.settings || {},
      theme: {
        ...typebotData.theme,
        // Ensure customCss exists to prevent undefined errors
        customCss: typebotData.theme?.customCss || "",
      },
      updatedAt: typebotData.updatedAt,
      workspaceId: typebotData.workspaceId,
    };

    return formatted;
  }, [typebotData]);

  return (
    <div
      style={{
        height: "100dvh",
        // Set background color to avoid SSR flash
        backgroundColor:
          background?.type === BackgroundType.COLOR
            ? background?.content
            : background?.type === BackgroundType.NONE
              ? undefined
              : "#fff",
      }}
    >
      <SEO
        url={url}
        typebotName={name}
        metadata={metadata}
        isMatchingViewerUrl={isMatchingViewerUrl}
      />
      <Standard
        typebot={publicId ?? undefined}
        onInit={clearQueryParamsIfNecessary}
        font={font ?? undefined}
        apiHost={apiOrigin}
        locale={locale}
        availableLocales={availableLocales}
        localeDetectionMeta={localeDetectionMeta}
      />
    </div>
  );
};
