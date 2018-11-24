import * as React from 'react'
import {Button, Dropdown, Icon, LocaleProvider, Radio, Menu} from 'antd';
import zhTW from 'antd/lib/locale-provider/zh_TW';
import moment from 'moment';
import 'moment/locale/zh-tw';
import {connect} from "react-redux";
import { withCookies, Cookies } from 'react-cookie';
import './Locale.less';
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
      const localeValue = e.key;
        this.setState({ locale: localeValue });
      if (localeValue) {
        switch (localeValue) {
          case 'zhTw':
            moment.locale('zh-tw');
            this.props.setLang('zh');
            cookies.set('lang', 'zh');
            break;
          case 'en':
            moment.locale('en');
            this.props.setLang('en');
            cookies.set('lang', 'en');
            break;
        }
        }
    }

    render() {
      const {locales, lang} = this.props;
      const menu = (
        <Menu>
          <Menu.Item key='en' onClick={this.changeLocale}>English</Menu.Item>
          <Menu.Item key='zhTw' onClick={this.changeLocale}>中文</Menu.Item>
        </Menu>
      );
        return (
            <div className="change-locale">
              <Dropdown overlay={menu} trigger={['click']}>
                <Button style={{marginLeft: 8}} size="small">
                  {locales[lang].language}
                  <Icon type="down"/>
                </Button>
              </Dropdown>
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
