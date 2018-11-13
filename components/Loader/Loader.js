
import * as React from 'react'
import { Spin } from 'antd';
import styles from './Loader.less';

class Loader extends React.Component {

    render() {
        return (
            <div className="loaderWrapper">
                <Spin tip="Loading..." size="large"/>
            </div>
        )
    }
}

export default Loader