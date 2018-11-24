import React, { Component } from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';
import { Button, Card, Col, Dropdown, Icon, Menu, Pagination, Row } from 'antd';
import Link from 'next/link';
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter';
import { decodeWebp } from '../../lib/customReducers';
import StickerTag from '../StickerTag/StickerTag';
import './StickersList.less';
import InfiniteScroll from 'react-infinite-scroller';
import Loader from '../Loader/Loader';
import cachios from "cachios";

class StickersList extends Component {
  converter = null;

  constructor(props) {
    super(props);
    this.state = {
      stickersList: this.props.stickersList,
      isLoading: true,
      hasMoreItems: true,
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

  loadMore = (page) => {
    cachios.get('/api/stickers?offset=' + page).then((resp) => {
      if (resp) {
        resp.data.data.map((item) => {
          this.state.stickersList.push(item);
        });
      }
    });
  }

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
    const {locales, lang} = this.props;
    let packList = [];

    this.state.stickersList.map((item, i) => {
      packList.push(
        <Col md={4}>
          <div className="Traybox">
            <img src={item.tray}/><br/>
          </div>
          <div className="Textbox">
            <p>{item.name}</p>
            {
              sticker.userTags.map( (userTag, itemIndex) => {
                return (
                  <StickerTag key={itemIndex} value={userTag} />
                )
              })
            }
          </div>
        </Col>
      );
    }

    const menu = (
      <Menu>
        <Menu.Item>
          <Link href={{ pathname: '/list', query: { sort: 'latest', page: 1 } }} as="/list/latest/page/1">
            <a>{locales[lang].latest}</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={{ pathname: '/list', query: { sort: 'popular', page: 1 } }} as="/list/popular/page/1">
            <a>{locales[lang].popular}</a>
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
              <Row className="StickersList" type="flex" justify="center">
                <InfiniteScroll
                  pageStart={this.props.page}
                  loadMore={this.loadMore.bind(this)}
                  hasMore={true}
                  loader={<div className="loader" key={0}>Loading ...</div>}>
                  {packList}
                </InfiniteScroll>
              </Row>
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

const mapStateToProps = reduxState => ({
  stickersList: reduxState.stickersList,
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(StickersList);
