import * as React from 'react';
import {Layout, Row} from "antd";
import './Wapper.less';

const { Content } = Layout;


const Wapper = ({ children }) => (
  <div className="Wapper">
    <Layout>
      <Row>
        <Content style={{padding: '0 50px', margin: '50px 0px 200px 0px'}}>
          {children}
        </Content>
      </Row>
    </Layout>
  </div>
)

export default Wapper
