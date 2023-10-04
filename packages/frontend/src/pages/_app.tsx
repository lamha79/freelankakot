import { SessionProvider } from "next-auth/react";
import { ChakraProvider, DarkMode } from '@chakra-ui/react'
import { HotToastConfig } from '@/components/layout/HotToastConfig'
import { env } from '@/components/config/environment'
import { getDeployments } from '@/deployments/deployments'
import { cache } from '@emotion/css'
import { CacheProvider } from '@emotion/react'
import { UseInkathonProvider } from '@scio-labs/use-inkathon'

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <UseInkathonProvider
      appName="ink!athon" // TODO
      connectOnInit={true}
      defaultChain={env.defaultChain}
      deployments={getDeployments()}
    >
      <CacheProvider value={cache}>
        <ChakraProvider>
          <SessionProvider session={session}>
            <Component {...pageProps} />
          </SessionProvider>

          <HotToastConfig />
        </ChakraProvider>
      </CacheProvider>
    </UseInkathonProvider>
  );
}
