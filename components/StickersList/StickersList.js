import React, { Component } from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';
import { Button, Card, Col, Dropdown, Icon, Menu, Pagination, Row } from 'antd';
import Link from 'next/link';
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter';
import { decodeWebp } from '../../lib/customReducers';
import './StickersList.less';

class StickersList extends Component {
  converter = null;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  isWebpSupported() {
    return this.props.userAgent.includes('Chrome') || this.props.userAgent.includes('Android');
  }

  paginationOnChange = (page) => {
    this.setState({
      isLoading: true,
    });
    Router.push({
      pathname: '/list',
      query: { page, sort: this.props.sort },
    }, `/list/${this.props.sort}/page/${page}`);
  };

  componentDidMount() {
    this.setState({
      isLoading: false,
    });

    if (!this.isWebpSupported()) {
      this.converter = new WhatsAppStickersConverter();
      this.converter.init().then(async () => {
        this.props.dispatch(decodeWebp(this.converter));
      }).catch(e => console.log(e));
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.page !== this.props.page || prevProps.sort !== this.props.sort) {
      this.setState({
        isLoading: false,
      });
      if (!this.isWebpSupported()) {
        this.props.dispatch(decodeWebp(this.converter));
      }
    }
  }

  render() {
    let packList = null;

    if (this.state.isLoading) {
      packList = <Card loading />;
    } else if (this.props.stickersList.length > 0) {
      packList = this.props.stickersList.map((sticker, itemIndex) => (
        <Card
          key={`set-${itemIndex}`}
          title={<div><div>{sticker.name}</div><div><i>by {sticker.publisher}</i></div></div>}
          bodyStyle={{display: 'flex'}}
          extra={(
            <div>
              <Link href={{ pathname: '/sticker', query: {uuid: sticker.uuid}}} as={`/sticker/${sticker.uuid}`}>
                <Button style={{ marginLeft: '10px' }} type="primary" size="large" ghost>
                  View more
                </Button>
              </Link>
            </div>
          )}
        >
          {
            sticker.stickers[0].slice(0, 4).map((item, itemIndex) => (
              <div style={{flexShrink: 1}}>
                <img
                  key={`sticker-${itemIndex}`}
                  src={this.isWebpSupported() ? item : (item.endsWith('.webp') ? '' : item)}
                  style={{width: '100%', maxWidth: '100px', objectFit: 'contain'}}
                />
              </div>

            ))
          }
        </Card>
      ));
    } else {
      packList = (
        <Card>
          No Stickers
        </Card>
      );
    }

    const menu = (
      <Menu>
        <Menu.Item>
          <Link href={{ pathname: '/list', query: { sort: 'latest', page: 1 } }} as="/list/latest/page/1">
            <a>Latest</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={{ pathname: '/list', query: { sort: 'popular', page: 1 } }} as="/list/popular/page/1">
            <a>Popular</a>
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Row type="flex" justify="center" style={{paddingTop: '10px'}}>
        <Col xs={24} md={18} lg={12}>
          <Card
            title="Stickers List"
            bodyStyle={{ justifyContent: 'center' }}
            extra={
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link">
                  Sort by: {this.props.sort} <Icon type="down" />
                </a>
              </Dropdown>
            }
          >
            <div>
              { packList }
              <Pagination
                current={this.props.page}
                onChange={this.paginationOnChange}
                total={this.props.itemCount}
                pageSize={this.props.pageSize}
              />
            </div>
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = reduxState => ({ stickersList: reduxState.stickersList }); // Use reduxApi endpoint names here

export default connect(mapStateToProps)(StickersList);
