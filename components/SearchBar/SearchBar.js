import * as React from 'react'
import { Input } from 'antd';

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
        return (
            <React.Fragment>
               <Search
                placeholder="input search text"
                onChange={e => this.handleOnSearch(e.target.value)}
                enterButton
                />
            </React.Fragment>
        )
    }
}

export default SearchBar;