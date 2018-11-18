import * as React from 'react'
import {Col, Row} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAndroid, faApple} from '@fortawesome/free-brands-svg-icons'
import { connect } from 'react-redux';
import styles from './Banner.less';

class Banner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    }
  }

  componentDidMount() {
    this.setState({
      isLoading: false,
    })
  }

  render() {
    const {...currentProps} = this.props;
    const { locales, lang } = this.props;
    const {dataSource} = currentProps;
    delete currentProps.dataSource;
    delete currentProps.isMobile;

    if (this.state.isLoading) {
      return (
        null
      )
    }

    return (
      <div {...currentProps} {...dataSource.wrapper}>
        <div
          key="QueueAnim"
          type={['bottom', 'top']}
          delay={200}
          {...dataSource.textWrapper}
        >
          <Row type="flex" style={{justifyContent: 'center', alignItems: 'center'}} className='fullscreen'>
            <Col md={6} lg={6} className="home-banner-content">

              <h1>
                                {locales[lang].site}
              </h1>
              <p>{locales[lang].intro}</p>
              <div className="download-button d-flex justify-content-start">
                <div className="buttons dark d-flex">
                  <div className="desc" className=" d-flex " style={{justifyContent: 'center', alignItems: 'center'}}>
                    <FontAwesomeIcon icon={faApple}/>
                    <a href="#">
                      <p>
                        <span>{locales[lang].comingSoon}</span> <br/>
                        {locales[lang].onAppStore}
                      </p>
                    </a>
                  </div>
                </div>
                <div className="buttons dark d-flex">
                  <FontAwesomeIcon icon={faAndroid}/>
                  <div className="desc" className=" d-flex " style={{justifyContent: 'center', alignItems: 'center'}}>
                    <a href="#">
                      <p>
                        <span>{locales[lang].comingSoon}</span> <br/>
                        {locales[lang].onPlayStore}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4} md={6} className='banner-img'>

            </Col>
          </Row>
        </div>
      </div>
    );


  }
}

const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(Banner);
