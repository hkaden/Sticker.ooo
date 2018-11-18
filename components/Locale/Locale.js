import * as React from 'react'
import { LocaleProvider, Radio } from 'antd';
import zhTW from 'antd/lib/locale-provider/zh_TW';
import moment from 'moment';
import 'moment/locale/zh-tw';
import {connect} from "react-redux";
import { withCookies, Cookies } from 'react-cookie';
import styles from './Locale.less';
import {
    setLang,
} from '../../lib/customReducers';


class Locale extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        locale: undefined,
    };
  }

  componentDidMount() {
    const { cookies } = this.props;
    const lang = cookies.get('lang') || 'en';
    this.props.setLang(lang);
    this.setState({
        locale: lang == 'en'? undefined: zhTW
    })
  }

    changeLocale = (e) => {
        const { cookies } = this.props;
        const localeValue = e.target.value;
        this.setState({ locale: localeValue });
        if (!localeValue) {
            moment.locale('en');
            this.props.setLang('en');
            cookies.set('lang', 'en');
        } else {
            moment.locale('zh-tw');
            this.props.setLang('zh');
            cookies.set('lang', 'zh');
        }
    }

    render() {
        const { lang } = this.props;
        return (
            <div className="change-locale">
            <Radio.Group value={this.state.locale} onChange={this.changeLocale}>
                <Radio.Button key="en" value={undefined}>English</Radio.Button>
                <Radio.Button key="zh" value={zhTW}>中文</Radio.Button>
            </Radio.Group>
            </div>
        );
    }
}

const mapStateToProps = reduxState => ({
    locales: reduxState.locales.locales,
    lang: reduxState.locales.lang,
  });
  
  
  const mapDispatchToProps = dispatch => ({
    setLang: (lang) => {
      dispatch(setLang(lang));
    },
  });

export default withCookies(connect(mapStateToProps, mapDispatchToProps)(Locale));