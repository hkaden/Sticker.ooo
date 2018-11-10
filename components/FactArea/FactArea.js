import * as React from 'react'
import styles from "../FactArea/FactArea.less"
import QueueAnim from 'rc-queue-anim';
import { Row, Col } from 'antd';
import OverPack from 'rc-scroll-anim/lib/ScrollOverPack';

class FactArea extends React.Component {

    getBlockChildren = (data) =>
        data.map((item, i) => {
            const children = item.children;
            return (
                <Col key={i.toString()} {...item}>
                    <div {...children.icon}>
                        <img src={children.icon.children} width="100%" alt="img" />
                    </div>
                    <h3 {...children.title}>{children.title.children}</h3>
                    <p {...children.content}>{children.content.children}</p>
                </Col>
            );
        });

    constructor(props) {
        super(props);

    }


    render() {
        const { ...props } = this.props;
        const { dataSource } = props;
        delete props.dataSource;
        delete props.isMobile;
        const listChildren = this.getBlockChildren(dataSource.block.children);
        return (
            <div {...props} {...dataSource.wrapper}>
                <div {...dataSource.page}>

                    <div className='fact-box'>
                    <OverPack {...dataSource.OverPack}>
                        <QueueAnim
                            type="bottom"
                            key="block"
                            leaveReverse
                            {...dataSource.block}
                            component={Row}
                        >

                                <Row type='flex' align="middle" justify="center">
                                    <Col className='single-fact'>
                                        <h2>100K+</h2>
                                        <p>Total Downloads</p>
                                    </Col>
                                    <Col className='single-fact'>
                                        <h2>100K+</h2>
                                        <p>Total Downloads</p>
                                    </Col>
                                    <Col className='single-fact'>
                                        <h2>100K+</h2>
                                        <p>Total Downloads</p>
                                    </Col>
                                    <Col className='single-fact'>
                                        <h2>100K+</h2>
                                        <p>Total Downloads</p>
                                    </Col>
                                </Row>

                        </QueueAnim>
                    </OverPack>
                    </div>
                </div>
            </div>
        );
    }
}

export default FactArea
