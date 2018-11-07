import * as React from 'react'
import { Button, Icon, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faApple, faAndroid } from '@fortawesome/free-brands-svg-icons'
import QueueAnim from 'rc-queue-anim';
import TweenOne from 'rc-tween-one';
import styles from './Banner.less';

class Banner extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
        const { ...currentProps } = this.props;
        const { dataSource } = currentProps;
        delete currentProps.dataSource;
        delete currentProps.isMobile;
        return (
            <div {...currentProps} {...dataSource.wrapper}>
                <style jsx>
                    { styles }
                </style>
                <div
                    key="QueueAnim"
                    type={['bottom', 'top']}
                    delay={200}
                    {...dataSource.textWrapper}
                >
                    <Row type="flex" style={{justifyContent: 'center', alignItems: 'center'}} className='fullscreen'>
                        <Col md={6} lg={6} className="home-banner-content" >

                            <h1>
                                Sticker.ooo
                            </h1>
                            <p>免費、開源、無廣告</p>
                            <div className="download-button d-flex justify-content-start">
                                <div className="buttons d-flex">
                                    <div className="desc" className=" d-flex " style={{justifyContent: 'center', alignItems: 'center'}} >
                                        <FontAwesomeIcon icon={ faApple } />
                                        <a href="#">
                                            <p >
                                                <span>Coming Soon</span> <br />
                                                on App Store
                                            </p>
                                        </a>
                                    </div>
                                </div>
                                <div className="buttons dark d-flex">
                                    <FontAwesomeIcon icon={ faAndroid } />
                                    <div className="desc" className=" d-flex " style={{justifyContent: 'center', alignItems: 'center'}}>
                                        <a href="#">
                                            <p>
                                                <span>Coming Soon</span> <br />
                                                on Play Store
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col lg={4} md={6} className='banner-img'>
                            <img {...dataSource.bannerImg} />
                        </Col>
                    </Row>
                </div>
            </div>
        );


    }
}

export default Banner
