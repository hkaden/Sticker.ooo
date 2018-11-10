import { withRouter } from 'next/router';

const Comp = props => (props.router.asPath);
export default withRouter()(Comp);
