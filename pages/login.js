import Layout from '../components/Layout/Layout'
import LoginForm from '../components/LoginForm/LoginForm'
import PageHead from "../components/PageHead/PageHead";
import reduxApi from '../lib/reduxApi';
import { loadStickersList } from '../lib/customReducers';

export default class Login extends React.Component {

  static async getInitialProps({ query }) {
    return { query };
  }

  render() {

    return (
      <React.Fragment>
        <PageHead pageId="PAGE_LOGIN"/>
        <Layout>
          <LoginForm query={this.props.query} />
        </Layout>
      </React.Fragment>
    );
  }
}
