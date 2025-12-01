import type React from "react";
import "../assets/styles.css";

type Props = {
  Component: React.ComponentType;
  pageProps: {
    [key: string]: unknown;
  };
};

export default function MyApp({
  Component,
  pageProps,
}: Props): React.JSX.Element {
  const { ...componentProps } = pageProps;

  return <Component {...componentProps} />;
}
