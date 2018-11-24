import * as React from 'react';
import Head from 'next/head';
import ConverterForm from '../components/ConverterForm/ConverterForm';
import Layout from '../components/Layout/Layout';
import PageHead from "../components/PageHead/PageHead";

const Converter = ({content}) => (
  <React.Fragment>
    {/* <Head>
      <script src="static/libwebpjs.out.js"/>
    </Head> */}
    <PageHead pageId="PAGE_SUBMIT_STICKERS" requireLibWebpJs={true}/>
    <Layout>
      <ConverterForm/>
    </Layout>
  </React.Fragment>
);

export default Converter;
