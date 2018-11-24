import Layout from '../components/Layout/Layout';
import ResetPasswordForm from "../components/ResetPasswordForm/ResetPasswordForm";
import PageHead from "../components/PageHead/PageHead";

export default class Login extends React.Component {

  static async getInitialProps({query}) {
    return {query};
  }

  render() {

    return (
      <React.Fragment>
        <PageHead pageId="PAGE_RESET_PASSWORD"/>
        <Layout>
          <ResetPasswordForm query={this.props.query}/>
        </Layout>
      </React.Fragment>
    );
  }
}
