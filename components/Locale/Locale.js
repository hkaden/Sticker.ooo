import * as React from 'react'
import { LocaleProvider, Radio } from 'antd';
import zhTW from 'antd/lib/locale-provider/zh_TW';
import moment from 'moment';
import 'moment/locale/zh-tw';
import styles from './Locale.less';

class Locale extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        locale: null,
    };
  }

    changeLocale = (e) => {
        const localeValue = e.target.value;
        this.setState({ locale: localeValue });
        if (!localeValue) {
            moment.locale('en');
        } else {
            moment.locale('zh-tw');
        }
    }

    render() {
        const { locale } = this.state;
        return (
        <div className="change-locale">
        <Radio.Group defaultValue={undefined} onChange={this.changeLocale}>
            <Radio.Button key="en" value={undefined}>English</Radio.Button>
            <Radio.Button key="zh" value={zhTW}>中文</Radio.Button>
        </Radio.Group>
        </div>
        );

    }
}

export default Locale
