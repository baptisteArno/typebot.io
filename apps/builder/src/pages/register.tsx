import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SignInPage } from "@/features/auth/components/SignInPage";
import {
  type AvailableProviders,
  getAvailableProviders,
} from "@/lib/auth/getAvailableProviders";

export const getServerSideProps: GetServerSideProps<{
  availableProviders: AvailableProviders;
}> = async () => {
  return {
    props: {
      availableProviders: getAvailableProviders(),
    },
  };
};

export default function Page({
  availableProviders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <SignInPage type="signup" availableProviders={availableProviders} />;
}
