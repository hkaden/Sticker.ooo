import * as React from 'react'
import styles from './Footer.less';
import TweenOne from "rc-tween-one"

class Footer extends React.Component {

    render() {
         const {...props} = this.props;
        const {dataSource, isMobile} = props;
        return (
          <TweenOne
            component="footer"
            className="footer"
          >
            <style jsx>
              {styles}
            </style>
              <div className="footerWrapper">
                <img width="100%" src={dataSource.logo.children} alt="img" style={{width:'150px'}}/>
              </div>
          </TweenOne>

        );

    }
}

export default Footer
