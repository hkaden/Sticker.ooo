import Layout from '../components/Layout/Layout';
import RegisterForm from '../components/RegisterForm/RegisterForm';
import PageHead from "../components/PageHead/PageHead";

export default class Register extends React.Component {

  render() {

    return (
      <React.Fragment>
        <PageHead pageId="PAGE_REGISTER"/>
        <Layout>
          <RegisterForm/>
        </Layout>
      </React.Fragment>
    );
  }
}
