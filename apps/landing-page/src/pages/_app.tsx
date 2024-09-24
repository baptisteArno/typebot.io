import React, { useEffect } from "react";
import "@/assets/style.css";
import { ChakraProvider } from "@chakra-ui/react";
import "focus-visible/dist/focus-visible";
import { theme } from "@/lib/chakraTheme";
import AOS from "aos";
import type { AppProps } from "next/app";
import "aos/dist/aos.css";

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    AOS.init({
      easing: "ease",
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default App;
