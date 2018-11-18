
import * as React from 'react'
import { Spin } from 'antd';
import { connect } from 'react-redux';
import './Loader.less';

class Loader extends React.Component {
    render() {
        const {locales, lang} = this.props;
        return (
            <div className="loaderWrapper">
                <Spin tip={locales[lang].loading} size="large"/>
            </div>
        )
    }
}

const mapStateToProps = reduxState => ({
    locales: reduxState.locales.locales,
    lang: reduxState.locales.lang,
  });
  
  export default connect(mapStateToProps)(Loader);