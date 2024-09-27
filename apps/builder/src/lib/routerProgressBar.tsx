import Router from "next/router";
import NProgress from "nprogress";
import { useEffect } from "react";

const progressStarted = () => NProgress.start();
const progressComplete = () => NProgress.done();

export const useRouterProgressBar = () =>
  useEffect(() => {
    if (typeof window !== "undefined") {
      NProgress.configure({ showSpinner: false });

      Router.events.on("routeChangeStart", progressStarted);
      Router.events.on("routeChangeComplete", progressComplete);
      Router.events.on("routeChangeError", progressComplete);
    }

    return () => {
      Router.events.off("routeChangeStart", progressStarted);
      Router.events.off("routeChangeComplete", progressComplete);
      Router.events.off("routeChangeError", progressComplete);
    };
  }, []);
