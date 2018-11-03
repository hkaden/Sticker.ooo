import * as React from 'react'
import withRedux from 'next-redux-wrapper'
import Helmet from 'react-helmet'
import ConverterForm from '../components/ConverterForm/ConverterForm'
import Wapper from '../components/Wapper/Wapper'
import {Row, Col, Card } from 'antd';

const Converter = ({content}) => (
    <div>
        <Helmet>
            <title>Submit page</title>
            <meta name="description" content="Converter page description"/>
        </Helmet>


        <Wapper>

            <Row type="flex" justify="center">
                <Col lg={10}>
                    <Card title="WhatsApp Stickers Converter (Chrome Desktop only)" bordered={false}>
                        <ConverterForm/>
                    </Card>

                </Col>
            </Row>
        </Wapper>
    </div>
)


const mapStateToProps = state => ({content: state.content})

export default Converter
