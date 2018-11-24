import Layout from '../components/Layout/Layout';
import ContactUsForm from '../components/ContactUsForm/ContactUsForm';
import PageHead from "../components/PageHead/PageHead";

export default class Contact extends React.Component {

  render() {
    return (      
      <React.Fragment>
        <PageHead pageId="PAGE_CONTACT_US"/>
        <Layout>
          <ContactUsForm/>
        </Layout>
      </React.Fragment>
    );
  }
}
