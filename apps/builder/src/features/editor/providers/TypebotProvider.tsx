import { NotFoundPage } from "@/components/NotFoundPage";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import { areTypebotsEqual } from "@/features/publish/helpers/areTypebotsEqual";
import { convertPublicTypebotToTypebot } from "@/features/publish/helpers/convertPublicTypebotToTypebot";
import { isPublished as isPublishedHelper } from "@/features/publish/helpers/isPublished";
import { preventUserFromRefreshing } from "@/helpers/preventUserFromRefreshing";
import { useAutoSave } from "@/hooks/useAutoSave";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { isDefined, omit } from "@typebot.io/lib/utils";
import type {
  PublicTypebot,
  PublicTypebotV6,
} from "@typebot.io/typebot/schemas/publicTypebot";
import {
  type TypebotV6,
  typebotV6Schema,
} from "@typebot.io/typebot/schemas/typebot";
import { dequal } from "dequal";
import { Router } from "next/router";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUndo } from "../hooks/useUndo";
import { type BlocksActions, blocksAction } from "./typebotActions/blocks";
import { type EdgesActions, edgesAction } from "./typebotActions/edges";
import { type EventsActions, eventsActions } from "./typebotActions/events";
import { type GroupsActions, groupsActions } from "./typebotActions/groups";
import { type ItemsActions, itemsAction } from "./typebotActions/items";
import {
  type VariablesActions,
  variablesAction,
} from "./typebotActions/variables";

const autoSaveTimeout = 15000;

// Localized TypebotV6 type with parsed localization fields
export type LocalizedTypebotV6 = Omit<
  TypebotV6,
  "supportedLocales" | "localeDetectionConfig"
> & {
  supportedLocales: string[];
  localeDetectionConfig: any;
};

// Transform typebot from API format (JSON strings) to frontend format (arrays/objects)
const transformTypebotFromAPI = (typebot: TypebotV6): LocalizedTypebotV6 => ({
  ...typebot,
  supportedLocales:
    typeof typebot.supportedLocales === "string"
      ? JSON.parse(typebot.supportedLocales)
      : typebot.supportedLocales,
  localeDetectionConfig:
    typeof typebot.localeDetectionConfig === "string"
      ? JSON.parse(typebot.localeDetectionConfig)
      : typebot.localeDetectionConfig,
});

// Transform typebot from frontend format to API format
const transformTypebotForAPI = (typebot: LocalizedTypebotV6): TypebotV6 => ({
  ...typebot,
});

type UpdateTypebotPayload = Partial<
  Pick<
    TypebotV6,
    | "theme"
    | "selectedThemeTemplateId"
    | "settings"
    | "publicId"
    | "name"
    | "icon"
    | "customDomain"
    | "resultsTablePreferences"
    | "isClosed"
    | "whatsAppCredentialsId"
    | "riskLevel"
    | "defaultLocale"
  > & {
    supportedLocales: string[];
    localeDetectionConfig: any;
  }
>;

export type SetTypebot = (
  newPresent:
    | LocalizedTypebotV6
    | ((current: LocalizedTypebotV6) => LocalizedTypebotV6),
) => void;

const typebotContext = createContext<
  {
    typebot?: LocalizedTypebotV6;
    publishedTypebot?: PublicTypebotV6;
    publishedTypebotVersion?: PublicTypebot["version"];
    currentUserMode: "guest" | "read" | "write";
    isPublished: boolean;
    isSavingLoading: boolean;
    save: (
      updates?: Partial<LocalizedTypebotV6>,
      overwrite?: boolean,
    ) => Promise<void>;
    undo: () => void;
    redo: () => void;
    canRedo: boolean;
    canUndo: boolean;
    updateTypebot: (props: {
      updates: UpdateTypebotPayload;
      save?: boolean;
      overwrite?: boolean;
    }) => Promise<LocalizedTypebotV6 | undefined>;
    restorePublishedTypebot: () => void;
    setAutoSaveEnabled: (enabled: boolean) => void;
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({});

export const TypebotProvider = ({
  children,
  typebotId,
}: {
  children: ReactNode;
  typebotId?: string;
}) => {
  const setElementsCoordinates = useSelectionStore(
    (state) => state.setElementsCoordinates,
  );

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const {
    data: typebotData,
    isLoading: isFetchingTypebot,
    refetch: refetchTypebot,
    error: typebotError,
  } = useQuery(
    trpc.typebot.getTypebot.queryOptions(
      { typebotId: typebotId as string, migrateToLatestVersion: true },
      {
        enabled: isDefined(typebotId),
        retry: 0,
      },
    ),
  );

  const { data: publishedTypebotData } = useQuery(
    trpc.typebot.getPublishedTypebot.queryOptions(
      { typebotId: typebotId as string, migrateToLatestVersion: true },
      {
        enabled:
          isDefined(typebotId) &&
          (typebotData?.currentUserMode === "read" ||
            typebotData?.currentUserMode === "write"),
      },
    ),
  );

  const { mutateAsync: updateTypebot, status: updateTypebotStatus } =
    useMutation(
      trpc.typebot.updateTypebot.mutationOptions({
        onError: (error) => {
          if (error.data?.code === "CONFLICT") {
            toast({
              title: "Could not update the typebot",
              description:
                "We detected that the typebot was updated since you last saved it so we couldn't save your current changes. If it is not expected, we suggest you overwrite the changes.",
              actionProps: {
                disabled: updateTypebotStatus === "pending",
                children: "Overwrite",
                onClick: async () => {
                  await saveTypebot(undefined, true);
                },
              },
            });
            return;
          }
          toast({
            title: "Error while updating typebot",
            description: error.message,
          });
        },
        onSuccess: () => {
          if (!typebotId) return;
          refetchTypebot();
        },
      }),
    );

  const typebot = typebotData?.typebot as TypebotV6;
  const publishedTypebot = (publishedTypebotData?.publishedTypebot ??
    undefined) as PublicTypebotV6 | undefined;
  const isReadOnly =
    typebotData &&
    ["read", "guest"].includes(typebotData?.currentUserMode ?? "guest");

  const [
    localTypebot,
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      setUpdateDate,
    },
  ] = useUndo<LocalizedTypebotV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setElementsCoordinates({
        groups: t.groups,
        events: t.events,
      });
    },
    onRedo: (t) => {
      setElementsCoordinates({
        groups: t.groups,
        events: t.events,
      });
    },
  });

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) {
      setLocalTypebot(undefined);
      setElementsCoordinates(undefined);
    }
    if (isFetchingTypebot || !typebot) return;
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot(transformTypebotFromAPI({ ...typebot }));
      setElementsCoordinates({
        groups: typebot.groups,
        events: typebot.events,
      });
      flush();
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    setElementsCoordinates,
    setLocalTypebot,
    typebot,
  ]);

  const saveTypebot = useCallback(
    async (updates?: Partial<LocalizedTypebotV6>, overwrite?: boolean) => {
      if (!localTypebot || !typebot || isReadOnly) return;
      const typebotToSave: LocalizedTypebotV6 = {
        ...localTypebot,
        ...updates,
      };
      if (
        dequal(
          JSON.parse(JSON.stringify(omit(typebot, "updatedAt"))),
          JSON.parse(JSON.stringify(omit(typebotToSave, "updatedAt"))),
        )
      )
        return;
      // Transform for schema validation (API format with JSON strings)
      const typebotForSchema = transformTypebotForAPI(typebotToSave);
      const newParsedTypebot = typebotV6Schema.parse(typebotForSchema);

      // Keep frontend-friendly format for local state
      setLocalTypebot(typebotToSave);

      try {
        const { typebot } = await updateTypebot({
          typebotId: typebotToSave.id,
          typebot: typebotForSchema, // Use transformed data for API
          overwrite,
        });
        setUpdateDate(typebot.updatedAt);
        if (overwrite) {
          setLocalTypebot(transformTypebotFromAPI(typebot));
        }
      } catch {
        setLocalTypebot({
          ...localTypebot,
        });
      }
    },
    [
      isReadOnly,
      localTypebot,
      setLocalTypebot,
      setUpdateDate,
      typebot,
      updateTypebot,
    ],
  );

  useAutoSave(
    {
      handler: autoSaveEnabled ? saveTypebot : () => Promise.resolve(),
      item: autoSaveEnabled ? localTypebot : null,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot, autoSaveEnabled],
  );

  useEffect(() => {
    const handleSaveTypebot = () => {
      saveTypebot();
    };
    Router.events.on("routeChangeStart", handleSaveTypebot);
    return () => {
      Router.events.off("routeChangeStart", handleSaveTypebot);
    };
  }, [saveTypebot]);

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(localTypebot.publicId) &&
      isDefined(publishedTypebot) &&
      isPublishedHelper(transformTypebotForAPI(localTypebot), publishedTypebot),
    [localTypebot, publishedTypebot],
  );

  useEffect(() => {
    if (!localTypebot || !typebot || isReadOnly) return;
    if (!areTypebotsEqual(transformTypebotForAPI(localTypebot), typebot)) {
      window.addEventListener("beforeunload", preventUserFromRefreshing);
    }

    return () => {
      window.removeEventListener("beforeunload", preventUserFromRefreshing);
    };
  }, [localTypebot, typebot, isReadOnly]);

  const updateLocalTypebot = async ({
    updates,
    save,
    overwrite,
  }: {
    updates: UpdateTypebotPayload;
    save?: boolean;
    overwrite?: boolean;
  }) => {
    if (!localTypebot || isReadOnly) return;
    const newTypebot = { ...localTypebot, ...updates };
    setLocalTypebot(newTypebot);
    if (save) await saveTypebot(newTypebot, overwrite);
    return newTypebot;
  };

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return;
    setLocalTypebot(
      transformTypebotFromAPI(
        convertPublicTypebotToTypebot(
          publishedTypebot,
          transformTypebotForAPI(localTypebot),
        ),
      ),
    );
  };

  if (typebotError?.data?.httpStatus === 404)
    return <NotFoundPage resourceName="Typebot" />;
  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        publishedTypebotVersion: publishedTypebotData?.version,
        currentUserMode: typebotData?.currentUserMode ?? "guest",
        isSavingLoading: updateTypebotStatus === "pending",
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        setAutoSaveEnabled,
        ...groupsActions(setLocalTypebot as SetTypebot),
        ...blocksAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
        ...eventsActions(setLocalTypebot as SetTypebot),
      }}
    >
      {children}
    </typebotContext.Provider>
  );
};

export const useTypebot = () => useContext(typebotContext);
