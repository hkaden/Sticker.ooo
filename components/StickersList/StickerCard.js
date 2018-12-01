import * as React from 'react'
import { Card, Row, Col } from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import LazyLoad from 'react-lazyload';
import StickerTag from '../StickerTag/StickerTag';
import './StickerCard.less'

const { Meta } = Card;

class StickerCard extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        
      };
    }

    render() {
        const { locales, lang, sticker } = this.props;
        console.log(sticker)
        return (

            <Link href={{ pathname: '/sticker', query: {uuid: sticker.uuid}}} as={`/sticker/${sticker.uuid}`}>
            <Card
                className="stickerCard"
                style={{ width: 300 }}
                title={sticker.name}
                actions={[
                    <div>
                       {locales[lang].stickers} <br/> {sticker.stats.stickers}
                    </div>, 
                    <div>
                        {locales[lang].views} <br/> {sticker.stats.totalViews}
                    </div>, 
                    <div>
                        {locales[lang].downloads} <br/> {sticker.stats.totalDownloads}
                    </div>, 
            ]}
            >
                <Row>
                    <Col xs={12}>
                        <LazyLoad height={120}>
                                <img src={sticker.tray}/>
                            </LazyLoad>
                    </Col>
                    <Col xs={12}>
                        { sticker.publisher} <br/>
                        {
                          sticker.userTags.map((userTag, itemIndex) => {
                            return (
                            <StickerTag key={itemIndex} value={userTag}/>
                            )
                        })
                        }
                    </Col>
                </Row>
          </Card>

                                </Link>
        )
    }
}

const mapStateToProps = reduxState => ({
    locales: reduxState.locales.locales,
    lang: reduxState.locales.lang,
  });
  
export default connect(mapStateToProps)(StickerCard);