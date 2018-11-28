import * as React from 'react'
import { Input } from 'antd';
import { connect } from 'react-redux';

const Search = Input.Search;

class SearchBar extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        
      };
    }

    handleOnSearch = (value) => {
        this.props.search(value);
    }

    render() {
        const { locales, lang } = this.props;
        return (
            <React.Fragment>
               <Search
                placeholder={locales[lang].search}
                onChange={e => this.handleOnSearch(e.target.value)}
                enterButton
                />
            </React.Fragment>
        )
    }
}

const mapStateToProps = reduxState => ({
    locales: reduxState.locales.locales,
    lang: reduxState.locales.lang,
  });
  
export default connect(mapStateToProps)(SearchBar);