import '../styles/globals.css'
import Layout from '../layouts/layout'
import '../styles/authentication.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'material-symbols'
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => { require('bootstrap/dist/js/bootstrap.js'); });

  return (<>
    <SessionProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  </>
  );
}

export default MyApp
