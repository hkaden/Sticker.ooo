import Layout from '../components/Layout/Layout'
import ResetPasswordForm from "../components/ResetPasswordForm/ResetPasswordForm"

export default class Login extends React.Component {

  static async getInitialProps({query}) {
    return {query};
  }

  render() {

    return (
      <Layout>
        <ResetPasswordForm query={this.props.query}/>
      </Layout>
    );
  }
}
