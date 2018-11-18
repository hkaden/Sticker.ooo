import * as React from 'react'
import styles from "../FactArea/FactArea.less"
import {Row, Col} from 'antd';
import cachios from 'cachios';
import numeral from 'numeral';
import { connect } from 'react-redux';

class FactArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: {}
    }
  }

  componentDidMount() {
    cachios.get("/api/statistics/stickers").then((resp) => {
      const respData = resp.data;
      this.setState({
        data: {
          totalPack: numeral(respData.public.packs + respData.link.packs + respData.private.packs).format('0,0'),
          totalWeeklyDownloads: numeral(respData.public.weeklyDownloads + respData.link.weeklyDownloads + respData.private.weeklyDownloads).format('0,0'),
          totalMonthlyDownloads: numeral(respData.public.monthlyDownloads + respData.link.monthlyDownloads + respData.private.monthlyDownloads).format('0,0'),
          totalYearlyDownloads: numeral(respData.public.yearlyDownloads + respData.link.yearlyDownloads + respData.private.yearlyDownloads).format('0,0')
        },
        isLoading: false,
      })
    });
  }


  render() {
    const {...props} = this.props;
    const { locales } = this.props;
    const {dataSource} = props;
    delete props.dataSource;
    delete props.isMobile;
    if (this.state.isLoading) {
      return (
        null
      )
    }
    return (

      <div {...props} {...dataSource.wrapper}>
        <div {...dataSource.page}>
          <div className='fact-box'>
            <div className='block-wrapper'>
              <Row type='flex' align="middle" justify="center">
                <Col xs={24} md={12} lg={6} className='single-fact'>
                  <h2>{this.state.data.totalPack}</h2>
                  <p>{locales.totalPacks}</p>
                </Col>
                <Col xs={24} md={12} lg={6} className='single-fact'>
                  <h2>{this.state.data.totalWeeklyDownloads}</h2>
                  <p>{locales.totalWeeklyDownloads}</p>
                </Col>
                <Col xs={24} md={12} lg={6} className='single-fact'>
                  <h2>{this.state.data.totalMonthlyDownloads}</h2>
                  <p>{locales.totalMonthlyDownloads}</p>
                </Col>
                <Col xs={24} md={12} lg={6} className='single-fact'>
                  <h2>{this.state.data.totalYearlyDownloads}</h2>
                  <p>{locales.totalYearlyDownloads}</p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = reduxState => ({
  locales: reduxState.locales,
});

export default connect(mapStateToProps)(FactArea);