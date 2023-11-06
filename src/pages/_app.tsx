import "../globals.css";
import type { AppProps } from "next/app";
import { UserAuthContextProvider } from "@/context/userAuthContext";
import i18n from "../../i18n";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "@/context/modalContext";
import Head from "next/head";
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth";

function MyApp({ Component, pageProps: { Session, ...pageProps }, }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <SessionProvider session={pageProps.session}>
        <UserAuthContextProvider>
          <I18nextProvider i18n={i18n}>
            <ModalProvider>
              <Head>
                <title>Learn Anything</title>
                <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, user-scalable=no, maximum-scale=1, minimum-scale=1" />
                <link rel="manifest" href="manifest.json" />
              </Head>
              <Component {...pageProps} />
            </ModalProvider>
          </I18nextProvider>
        </UserAuthContextProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
