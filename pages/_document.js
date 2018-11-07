import Document, { Head, Main, NextScript } from 'next/document';
import styles from "../static/app.less"
import * as React from "react"
export default class MyDocument extends Document {
    render () {
        return (
            <html>
            <Head>
                <meta name='generator' content='mdx-docs' />
                <meta charSet='utf-8'/>
                <meta httpEquiv='content-language' content='en'/>
                <meta name='viewport' content='initial-scale=1.0, width=device-width'/>
                <link rel="stylesheet" href="/_next/static/style.css" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
            </html>
        )
    }
}
