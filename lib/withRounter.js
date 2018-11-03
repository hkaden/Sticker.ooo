import { withRouter } from 'next/router'

const Comp = (props) => { return ( props.router.asPath ) }
export default withRouter()(Comp)
