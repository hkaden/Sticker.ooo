import * as React from 'react'
import styles from './Footer.less';
import TweenOne from "rc-tween-one"

class Footer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        phoneOpen: false,
        menuHeight: 0,
      };
    }

    render() {
      const {...props} = this.props;
      const {dataSource, isMobile} = props;
      delete props.dataSource;
      delete props.isMobile;
      const navData = dataSource.Menu.children;
      const navChildren = Object.keys(navData).map((key, i) => (
        <li key={i.toString()} {...navData[key]} className="item">
          <a
            {...navData[key].a}
            href={navData[key].a.href}
            target={navData[key].a.target}
            className="link"
          >
            {navData[key].a.children}
          </a>
        </li>
      ));

        return (
          <TweenOne
            component="footer"
            className="footer"
          >
              <div className="footerWrapper">
                <img width="100%" src={dataSource.logo.children} alt="img" style={{width:'150px'}}/>
                <div className="link">
                  <ul className="nav">
                    {navChildren}
                  </ul>
                </div>
              </div>
          </TweenOne>

        );

    }
}

export default Footer
