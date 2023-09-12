import { AppProps } from 'next/app';
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";

import { client } from '@/libs/apollo';

import '@/styles/globals.scss';

export default function App({ Component, pageProps }: AppProps) {

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
      <Toaster />
    </ApolloProvider>
  )
}
