import { useQuery } from "@tanstack/react-query";
import { env } from "@typebot.io/env";
import { datesAreOnSameDay } from "@typebot.io/lib/datesAreOnSameDay";
import { isDefined } from "@typebot.io/lib/utils";
import type { ClientUser, UpdateUser, User } from "@typebot.io/user/schemas";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { authClient, useSession } from "@/lib/auth/client";
import { trpc } from "@/lib/queryClient";
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
  const { data: session, isPending } = useSession();
  const status = isPending
    ? "loading"
    : session?.user
      ? "authenticated"
      : "unauthenticated";
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>();
  const { theme, setTheme } = useTheme();
  const [localUser, setLocalUser] = useState<ClientUser>();

  // Fetch full user data from database when session is available
  const { data: fullUserData, isLoading: isUserLoading } = useQuery(
    trpc.userInternal.getMe.queryOptions(undefined, {
      enabled: !!session?.user?.id,
    }),
  );

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (theme === (localUser?.preferredAppAppearance ?? "system")) return;
    setTheme(localUser?.preferredAppAppearance ?? "system");
  }, [localUser?.preferredAppAppearance]);

  useEffect(() => {
    if (isDefined(session?.user?.id)) return;
    setCurrentWorkspaceId(
      localStorage.getItem("currentWorkspaceId") ?? undefined,
    );
  }, [session?.user?.id]);

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
      !fullUserData?.termsAcceptedAt &&
      fullUserData?.createdAt &&
      datesAreOnSameDay(new Date(fullUserData.createdAt), new Date())
    ) {
      router.replace("/onboarding");
    }
  }, [
    router.isReady,
    router.pathname,
    status,
    fullUserData?.termsAcceptedAt,
    fullUserData?.createdAt,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    if (status === "loading" || isUserLoading) return;

    const preferredLanguage = fullUserData?.preferredLanguage;
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
  }, [
    router.isReady,
    router.locale,
    status,
    isUserLoading,
    fullUserData?.preferredLanguage,
  ]);

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
    if ((!fullUserData && !localUser) || (fullUserData && localUser)) return;
    setLocalUser(fullUserData);
  }, [fullUserData, localUser]);

  const handleSignOut = () => {
    authClient.signOut().then(() => {
      router.push("/signin");
    });
  };

  return (
    <userContext.Provider
      value={{
        user: localUser,
        isLoading: status === "loading" || isUserLoading,
        logOut: handleSignOut,
        updateUser,
        currentWorkspaceId,
        updateLocalUserEmail,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
