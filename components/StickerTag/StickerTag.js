import * as React from 'react'
import { Tag } from 'antd';

class StickerTag extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        
      }
    }

    render() {
      const { value } = this.props;
      return (
        <Tag color="#FED700">
          { value }
        </Tag>
      );
    }
}

export default StickerTag;