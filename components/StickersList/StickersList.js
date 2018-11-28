import React, { Component } from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';
import { Button, Card, Col, Dropdown, Icon, Menu, Pagination, Row } from 'antd';
import Link from 'next/link';
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter';
import { decodeWebp } from '../../lib/customReducers';
import StickerTag from '../StickerTag/StickerTag';
import SearchBar from '../SearchBar/SearchBar';
import './StickersList.less';
import InfiniteScroll from 'react-infinite-scroller';
import Loader from '../Loader/Loader';
import cachios from "cachios";
import LazyLoad from 'react-lazyload';

class StickersList extends Component {
  converter = null;

  constructor(props) {
    super(props);
    this.state = {
      stickersList: this.props.stickersList,
      isLoading: true,
      hasMoreItems: true,
      searching: false,
      filtered_stickersList: []
    };

    this.search = this.search.bind(this);
  }

  isWebpSupported() {
    return this.props.userAgent.includes('Chrome') || this.props.userAgent.includes('Android');
  }

  loadMore = (page) => {
    if(!this.state.searching) {
      cachios.get('/api/stickers?offset=' + page + '&limit=24' + '&sort=createdAt')
      .then((resp) => {
      if (resp) {
        resp.data.data.map((item) => {
          this.state.stickersList.push(item);
        });
        this.forceUpdate();
      }

      if (this.state.stickersList.length >= resp.data.count)
        this.state.hasMoreItems = false

    });
    } 
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

  search = (value) => {
    this.setState({
      searching: value? true : false
    });
    let { stickersList } = this.state;
    value = value.toLowerCase();
    let filtered_stickersList = stickersList.filter((sticker) => {
      let name = sticker.name.toLowerCase();
      return name.indexOf(value) > -1;
    });
    this.setState({
      filtered_stickersList
    });
  }


  render() {
    const {locales, lang} = this.props;
    let packList = [];

    let stickerList = this.state.filtered_stickersList.length > 0 ? this.state.filtered_stickersList : this.state.stickersList;
    stickerList.map((item, i) => {
      packList.push(
        <Col className="TrayWrapper" xs={8} md={4}>
          <div className="Traybox">
            <LazyLoad height={120}>
              <Link href={{ pathname: '/sticker', query: {uuid: item.uuid}}} as={`/sticker/${item.uuid}`}>
              <img src={item.tray}/>
              </Link>
            </LazyLoad>
          </div>
          <div className="Textbox">
            <Link href={{ pathname: '/sticker', query: {uuid: item.uuid}}} as={`/sticker/${item.uuid}`}>
            <p>{item.name}</p>
            </Link>
            <p className="publisher">{item.publisher}</p>
            {
              item.userTags.map((userTag, itemIndex) => {
                return (
                  <StickerTag key={itemIndex} value={userTag}/>
                )
              })
            }

          </div>

        </Col>
      );
    });

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
        <Col xs={24}>
          <Card
            bodyStyle={{ justifyContent: 'center' }}
            bordered={false}
            title={<SearchBar search={this.search}/>}
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
                  hasMore={this.state.hasMoreItems}
                  loader={this.state.searching? null: <Loader/>}>
                  {packList}
                </InfiniteScroll>
              </Row>
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
