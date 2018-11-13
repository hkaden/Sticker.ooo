import Document, { Head, Main, NextScript } from 'next/document';
import * as React from 'react';
import styles from '../static/app.less';

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta name="generator" content="mdx-docs" />
          <meta charSet="utf-8" />
          <meta httpEquiv="content-language" content="en" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
