import Layout from '../components/Layout/Layout';
import ForgetForm from '../components/ForgetForm/ForgetForm';
import PageHead from "../components/PageHead/PageHead";

export default class Forget extends React.Component {

  render() {
    return (      
      <React.Fragment>
        <PageHead pageId="PAGE_FORGET_PASSWORD"/>
        <Layout>
          <ForgetForm/>
        </Layout>
      </React.Fragment>
    );
  }
}
