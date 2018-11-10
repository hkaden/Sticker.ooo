import * as React from 'react';
import { Row, Col, Card } from 'antd';
import Head from 'next/head';
import ConverterForm from '../components/ConverterForm/ConverterForm';
import Wapper from '../components/Wapper/Wapper';

const Converter = ({ content }) => (
  <div>
    <Head>
      <title>Submit page</title>
      <meta name="description" content="Converter page description" />
      <meta charSet="utf-8" />
      <meta httpEquiv="content-language" content="en" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="stylesheet" href="/static/app.css" />
      <script src="static/libwebpjs.out.js" />
    </Head>

    <Wapper>

      <Row type="flex" justify="center">
        <Col lg={10}>
          <Card title="WhatsApp Stickers Converter" bordered={false}>
            <ConverterForm />
          </Card>
        </Col>
      </Row>
    </Wapper>
  </div>
);


const mapStateToProps = state => ({ content: state.content });

export default Converter;
