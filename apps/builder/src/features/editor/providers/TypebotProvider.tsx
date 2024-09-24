import { useGroupsStore } from "@/features/graph/hooks/useGroupsStore";
import { areTypebotsEqual } from "@/features/publish/helpers/areTypebotsEqual";
import { convertPublicTypebotToTypebot } from "@/features/publish/helpers/convertPublicTypebotToTypebot";
import { isPublished as isPublishedHelper } from "@/features/publish/helpers/isPublished";
import { preventUserFromRefreshing } from "@/helpers/preventUserFromRefreshing";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
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
  >
>;

export type SetTypebot = (
  newPresent: TypebotV6 | ((current: TypebotV6) => TypebotV6),
) => void;

const typebotContext = createContext<
  {
    typebot?: TypebotV6;
    publishedTypebot?: PublicTypebotV6;
    publishedTypebotVersion?: PublicTypebot["version"];
    currentUserMode: "guest" | "read" | "write";
    is404: boolean;
    isPublished: boolean;
    isSavingLoading: boolean;
    save: (updates?: Partial<TypebotV6>, overwrite?: boolean) => Promise<void>;
    undo: () => void;
    redo: () => void;
    canRedo: boolean;
    canUndo: boolean;
    updateTypebot: (props: {
      updates: UpdateTypebotPayload;
      save?: boolean;
      overwrite?: boolean;
    }) => Promise<TypebotV6 | undefined>;
    restorePublishedTypebot: () => void;
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
  const { showToast } = useToast();
  const [is404, setIs404] = useState(false);
  const setGroupsCoordinates = useGroupsStore(
    (state) => state.setGroupsCoordinates,
  );

  const {
    data: typebotData,
    isLoading: isFetchingTypebot,
    refetch: refetchTypebot,
  } = trpc.typebot.getTypebot.useQuery(
    { typebotId: typebotId as string, migrateToLatestVersion: true },
    {
      enabled: isDefined(typebotId),
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) {
          setIs404(true);
          return;
        }
        setIs404(false);
        showToast({
          title: "Could not fetch typebot",
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: "json",
          },
        });
      },
      onSuccess: () => {
        setIs404(false);
      },
    },
  );

  const { data: publishedTypebotData } =
    trpc.typebot.getPublishedTypebot.useQuery(
      { typebotId: typebotId as string, migrateToLatestVersion: true },
      {
        enabled:
          isDefined(typebotId) &&
          (typebotData?.currentUserMode === "read" ||
            typebotData?.currentUserMode === "write"),
        onError: (error) => {
          showToast({
            title: "Could not fetch published typebot",
            description: error.message,
            details: {
              content: JSON.stringify(
                error.data?.zodError?.fieldErrors,
                null,
                2,
              ),
              lang: "json",
            },
          });
        },
      },
    );

  const { mutateAsync: updateTypebot, isLoading: isSaving } =
    trpc.typebot.updateTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: "Error while updating typebot",
          description: error.message,
        }),
      onSuccess: () => {
        if (!typebotId) return;
        refetchTypebot();
      },
    });

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
  ] = useUndo<TypebotV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setGroupsCoordinates(t.groups);
    },
    onRedo: (t) => {
      setGroupsCoordinates(t.groups);
    },
  });

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) {
      setLocalTypebot(undefined);
      setGroupsCoordinates(undefined);
    }
    if (isFetchingTypebot || !typebot) return;
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot({ ...typebot });
      setGroupsCoordinates(typebot.groups);
      flush();
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    setGroupsCoordinates,
    setLocalTypebot,
    showToast,
    typebot,
  ]);

  const saveTypebot = useCallback(
    async (updates?: Partial<TypebotV6>, overwrite?: boolean) => {
      if (!localTypebot || !typebot || isReadOnly) return;
      const typebotToSave = {
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
      const newParsedTypebot = typebotV6Schema.parse({ ...typebotToSave });
      setLocalTypebot(newParsedTypebot);
      try {
        const { typebot } = await updateTypebot({
          typebotId: newParsedTypebot.id,
          typebot: newParsedTypebot,
        });
        setUpdateDate(typebot.updatedAt);
        if (overwrite) {
          setLocalTypebot(typebot);
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
      handler: saveTypebot,
      item: localTypebot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot],
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
      isPublishedHelper(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot],
  );

  useEffect(() => {
    if (!localTypebot || !typebot || isReadOnly) return;
    if (!areTypebotsEqual(localTypebot, typebot)) {
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
      convertPublicTypebotToTypebot(publishedTypebot, localTypebot),
    );
  };

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        publishedTypebotVersion: publishedTypebotData?.version,
        currentUserMode: typebotData?.currentUserMode ?? "guest",
        isSavingLoading: isSaving,
        is404,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
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
