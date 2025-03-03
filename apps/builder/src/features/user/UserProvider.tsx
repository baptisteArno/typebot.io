import { toast } from "@/lib/toast";
import { useColorMode } from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import type {
  ClientUser,
  UpdateUser,
  User,
} from "@typebot.io/schemas/features/user/schema";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { setLocaleInCookies } from "./helpers/setLocaleInCookies";
import { updateUserQuery } from "./queries/updateUserQuery";

export const userContext = createContext<{
  user?: ClientUser;
  isLoading: boolean;
  currentWorkspaceId?: string;
  logOut: () => void;
  updateUser: (newUser: Partial<UpdateUser>) => void;
}>({
  isLoading: false,
  logOut: () => {},
  updateUser: () => {},
});

const debounceTimeout = 1000;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>();
  const { setColorMode } = useColorMode();

  useEffect(() => {
    const currentColorScheme = localStorage.getItem("chakra-ui-color-mode") as
      | "light"
      | "dark"
      | null;
    if (!currentColorScheme) return;
    const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const userPrefersSystemMode =
      !session?.user?.preferredAppAppearance ||
      session.user.preferredAppAppearance === "system";
    const computedColorMode = userPrefersSystemMode
      ? systemColorScheme
      : session.user?.preferredAppAppearance;
    if (computedColorMode === currentColorScheme) return;
    setColorMode(computedColorMode);
  }, [setColorMode, session?.user?.preferredAppAppearance]);

  useEffect(() => {
    if (isDefined(session?.user.id)) return;
    setCurrentWorkspaceId(
      localStorage.getItem("currentWorkspaceId") ?? undefined,
    );
  }, [session?.user.id]);

  useEffect(() => {
    if (!router.isReady) return;
    if (status === "loading") return;
    const isSignInPath = [
      "/signin",
      "/register",
      "/signin/email-redirect",
    ].includes(router.pathname);
    const isPathPublicFriendly = /\/typebots\/.+\/(edit|theme|settings)/.test(
      router.pathname,
    );
    if (isSignInPath || isPathPublicFriendly) return;
    if (status === "unauthenticated")
      router.replace({
        pathname: "/signin",
        query:
          router.asPath !== "/typebots"
            ? {
                redirectPath: router.asPath,
              }
            : undefined,
      });
  }, [router.isReady, router.pathname, status]);

  useEffect(() => {
    if (!router.isReady) return;
    if (status === "loading") return;

    const preferredLanguage = session?.user?.preferredLanguage;
    const currentLocale = router.locale;

    if (preferredLanguage && preferredLanguage !== currentLocale) {
      setLocaleInCookies(preferredLanguage);
      router.replace(
        {
          pathname: router.pathname,
          query: router.query,
        },
        undefined,
        { locale: preferredLanguage },
      );
    }
  }, [router.isReady, router.locale, status, session?.user?.preferredLanguage]);

  const saveUser = useDebouncedCallback(
    async (updates: Partial<User>) => {
      if (isNotDefined(session)) return;
      const { error } = await updateUserQuery(session.user.id, updates);
      if (error) toast({ context: error.name, description: error.message });
      await refreshUser();
    },
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  useEffect(() => {
    return () => {
      saveUser.flush();
    };
  }, [saveUser]);

  return (
    <userContext.Provider
      value={{
        user: session?.user,
        isLoading: status === "loading",
        logOut: signOut,
        updateUser: saveUser,
        currentWorkspaceId,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const refreshUser = async () => {
  await fetch("/api/auth/session?update");
  reloadSession();
};

const reloadSession = () => {
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};
