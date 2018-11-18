import * as React from 'react';
import TweenOne from "rc-tween-one";
import { connect } from 'react-redux';
import './Footer.less';

class Footer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        phoneOpen: false,
        menuHeight: 0,
        isLoading: true,
      };
    }

    componentDidMount() {
      this.setState({
        isLoading: false
      })
    }
    render() {
      const {...props} = this.props;
      const {dataSource, isMobile, lang} = props;
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
            {navData[key].a.children[lang]}
          </a>
        </li>
      ));

        if(this.state.isLoading){
          return (null)
        }
        
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

const mapStateToProps = reduxState => ({
  lang: reduxState.locales.lang,
});


export default connect(mapStateToProps)(Footer)
