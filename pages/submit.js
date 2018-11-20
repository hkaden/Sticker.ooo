import * as React from 'react';
import Head from 'next/head';
import ConverterForm from '../components/ConverterForm/ConverterForm';
import Layout from '../components/Layout/Layout';

const Converter = ({content}) => (
  <div>
    <Head>
      <script src="static/libwebpjs.out.js"/>
    </Head>

    <Layout>
      <ConverterForm/>
    </Layout>
  </div>
);

export default Converter;
