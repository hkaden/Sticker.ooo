import * as React from 'react'
import styles from './Wapper.less'
import {Layout, Row} from "antd";
const { Header, Content, Footer, Sider } = Layout;


const Wapper = ({ children }) => (
    <div className="Wapper">
        <style jsx global>
            {styles}
        </style>
        <Layout>
            <Row type="flex" justify="center" >
                <Content style={{ padding: '0 50px' , margin: '50px 0px 200px 0px' }}>
                    {children}
                </Content>
            </Row>
        </Layout>
    </div>
)

export default Wapper
