import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { connect } from 'react-redux';

class PageHead extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { requireLibWebpJs, pageId, overrideTitle, locales, lang } = this.props;
        let title = locales[lang][pageId].title || 'Sticker.ooo';
        let description = locales[lang][pageId].description || 'Sticker.ooo';

        if(overrideTitle) {
            title = overrideTitle
        } 
        
        return (
            <Head>
                <title>{title}</title>
                <meta name='description' content={description}/>
                <meta charSet='utf-8'/>
                <meta httpEquiv='content-language' content={lang}/>
                <meta name='viewport' content='initial-scale=1.0, width=device-width'/>
                { requireLibWebpJs && <script src="static/libwebpjs.out.js"/> }
            </Head>
        );
    }
}

PageHead.propTypes = {
    pageId: PropTypes.string,
    overrideTitle: PropTypes.string,
    requireLibWebpJs: PropTypes.bool,
    locales: PropTypes.object,
    lang: PropTypes.string
};

const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(PageHead)
