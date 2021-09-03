import '../styles/normalize.css'
import '../styles/skeleton.css'
import { useEffect } from 'react'
import * as Sentry from '@sentry/node'
import AuthProvider from '../auth/AuthProvider'
import ThemeProvider from '../theme/ThemeProvider'
import withData from "../lib/apollo"
import {withAuthSync} from '../lib/auth'
import { useRouter } from 'next/router'
import * as gtag from '../lib/gtag'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    enabled: process.env.NODE_ENV === 'production',
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN
  });
}

function App({ Component, pageProps, err }) {

  useEffect(() => {
    if("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
       navigator.serviceWorker.register("/ptl-sw.js").then(
          function (registration) {
            // console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          function (err) {
            // console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, [])


  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])  

  const AuthSyncComponent = withAuthSync(Component)

  return (
    <AuthProvider>
        <ThemeProvider>
            <AuthSyncComponent {...pageProps} err={err} />
        </ThemeProvider>
    </AuthProvider>
  )
}

export default withData(App);