import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import { byId } from "@typebot.io/lib/utils";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTypebot } from "../editor/providers/TypebotProvider";
import { useUser } from "../user/hooks/useUser";
import { parseNewName } from "./helpers/parseNewName";
import { setWorkspaceIdInLocalStorage } from "./helpers/setWorkspaceIdInLocalStorage";

export type WorkspaceInApp = Omit<
  Workspace,
  | "chatsLimitFirstEmailSentAt"
  | "chatsLimitSecondEmailSentAt"
  | "storageLimitFirstEmailSentAt"
  | "storageLimitSecondEmailSentAt"
  | "customStorageLimit"
  | "additionalChatsIndex"
  | "additionalStorageIndex"
  | "isQuarantined"
>;

type WorkspaceUpdateProps = {
  icon?: string;
  name?: string;
};

const workspaceContext = createContext<{
  workspaces: Pick<Workspace, "id" | "name" | "icon" | "plan">[];
  workspace?: WorkspaceInApp;
  currentUserMode?: "read" | "write" | "guest";
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name?: string) => Promise<void>;
  updateWorkspace: (updates: WorkspaceUpdateProps) => void;
  deleteCurrentWorkspace: () => Promise<void>;
  //@ts-ignore
}>({});

type WorkspaceContextProps = {
  typebotId?: string;
  children: ReactNode;
};

export const WorkspaceProvider = ({
  typebotId,
  children,
}: WorkspaceContextProps) => {
  const {
    pathname,
    query,
    push,
    isReady: isRouterReady,
    replace,
  } = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();

  const { typebot } = useTypebot();

  const trpcContext = trpc.useContext();

  const { data: workspacesData } = trpc.workspace.listWorkspaces.useQuery(
    undefined,
    {
      enabled: !!user,
    },
  );
  const workspaces = useMemo(
    () => workspacesData?.workspaces ?? [],
    [workspacesData?.workspaces],
  );

  const { data: workspaceData } = trpc.workspace.getWorkspace.useQuery(
    { workspaceId: workspaceId as string },
    { enabled: !!workspaceId },
  );

  const workspace = workspaceData?.workspace;

  const createWorkspaceMutation = trpc.workspace.createWorkspace.useMutation({
    onError: (error) => toast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.listWorkspaces.invalidate();
    },
  });

  const updateWorkspaceMutation = trpc.workspace.updateWorkspace.useMutation({
    onError: (error) => toast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.getWorkspace.invalidate();
    },
  });

  const deleteWorkspaceMutation = trpc.workspace.deleteWorkspace.useMutation({
    onError: (error) => toast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.listWorkspaces.invalidate();
      setWorkspaceId(undefined);
    },
  });

  useEffect(() => {
    if (
      pathname === "/signin" ||
      !isRouterReady ||
      !workspaces ||
      workspaces.length === 0 ||
      workspaceId ||
      (typebotId && !typebot?.workspaceId)
    )
      return;
    const lastWorspaceId =
      typebot?.workspaceId ??
      query.workspaceId?.toString() ??
      localStorage.getItem("workspaceId");

    const defaultWorkspaceId = lastWorspaceId
      ? workspaces.find(byId(lastWorspaceId))?.id
      : workspaces[0].id;

    const newWorkspaceId = defaultWorkspaceId ?? workspaces[0].id;
    setWorkspaceIdInLocalStorage(newWorkspaceId);
    setWorkspaceId(newWorkspaceId);
  }, [
    isRouterReady,
    pathname,
    query.workspaceId,
    typebot?.workspaceId,
    typebotId,
    userId,
    workspaceId,
    workspaces,
  ]);

  useEffect(() => {
    if (workspace?.isSuspended) {
      if (pathname === "/suspended") return;
      push("/suspended");
      return;
    }
    if (workspace?.isPastDue) {
      if (pathname === "/past-due") return;
      push("/past-due");
      return;
    }
  }, [pathname, push, workspace?.isPastDue, workspace?.isSuspended]);

  const switchWorkspace = (workspaceId: string) => {
    setWorkspaceIdInLocalStorage(workspaceId);
    setWorkspaceId(workspaceId);
    replace("/typebots");
  };

  const createWorkspace = async (userFullName?: string) => {
    if (!workspaces) return;
    const name = parseNewName(userFullName, workspaces);
    const { workspace } = await createWorkspaceMutation.mutateAsync({ name });
    setWorkspaceId(workspace.id);
  };

  const updateWorkspace = (updates: WorkspaceUpdateProps) => {
    if (!workspaceId) return;
    updateWorkspaceMutation.mutate({
      workspaceId,
      ...updates,
    });
  };

  const deleteCurrentWorkspace = async () => {
    if (!workspaceId || !workspaces || workspaces.length < 2) return;
    await deleteWorkspaceMutation.mutateAsync({ workspaceId });
  };

  return (
    <workspaceContext.Provider
      value={{
        workspaces,
        workspace,
        currentUserMode: workspaceData?.currentUserMode,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteCurrentWorkspace,
      }}
    >
      {children}
    </workspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(workspaceContext);
