import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import type { ClientUser, UpdateUser, User } from "@typebot.io/user/schemas";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import { datesAreOnSameDay } from "@/helpers/datesAreOnSameDate";
import { useDebounce } from "@/hooks/useDebounce";
import { setLocaleInCookies } from "./helpers/setLocaleInCookies";
import { useUpdateUserMutation } from "./hooks/useUpdateUserMutation";

export const userContext = createContext<{
  user?: ClientUser;
  isLoading: boolean;
  currentWorkspaceId?: string;
  logOut: () => void;
  updateUser: (newUser: Partial<UpdateUser>) => void;
  updateLocalUserEmail: (newEmail: string) => void;
}>({
  isLoading: false,
  logOut: () => {},
  updateUser: () => {},
  updateLocalUserEmail: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>();
  const { theme, setTheme } = useTheme();
  const [localUser, setLocalUser] = useState<ClientUser>();

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (theme === (localUser?.preferredAppAppearance ?? "system")) return;
    setTheme(localUser?.preferredAppAppearance ?? "system");
  }, [localUser?.preferredAppAppearance]);

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
    if (
      env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID &&
      !router.pathname.includes("/onboarding") &&
      !session?.user.termsAcceptedAt &&
      session?.user.createdAt &&
      datesAreOnSameDay(new Date(session.user.createdAt), new Date())
    ) {
      router.replace("/onboarding");
    }
  }, [router.isReady, router.pathname, status, session?.user.termsAcceptedAt]);

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

  const updateUser = async (updates: Partial<User>) => {
    if (!localUser) return;
    setLocalUser({ ...localUser, ...updates });
    await saveUser(updates);
  };

  const saveUser = useDebounce(async (updates: Partial<User>) => {
    if (!localUser) return;
    updateUserMutation.mutate({ updates });
  }, 1000);

  const updateLocalUserEmail = (newEmail: string) => {
    if (!localUser) return;
    setLocalUser({ ...localUser, email: newEmail });
  };

  useEffect(() => {
    if ((!session?.user && !localUser) || (session?.user && localUser)) return;
    setLocalUser(session?.user);
  }, [session?.user, localUser]);

  return (
    <userContext.Provider
      value={{
        user: localUser,
        isLoading: status === "loading",
        logOut: signOut,
        updateUser,
        currentWorkspaceId,
        updateLocalUserEmail,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
