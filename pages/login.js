import Layout from '../components/Layout/Layout'
import LoginForm from '../components/LoginForm/LoginForm'
import reduxApi from '../lib/reduxApi';
import { loadStickersList } from '../lib/customReducers';

export default class Login extends React.Component {

  static async getInitialProps({ query }) {
    return { query };
  }

  render() {

    return (
      <Layout>
        <LoginForm query={this.props.query} />
      </Layout>
    );
  }
}
