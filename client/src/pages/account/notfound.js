import { useLocation } from "react-router-dom";
import { connect } from 'react-redux';

export default function NotFound() {
    let location = useLocation();
    return (
        <article>
            <header>
                <h2>#404 Page Not Found</h2>
            </header>
            <p>The requested URL <code>{location.pathname}</code> could not found be on this server.</p>
        </article>
    );
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    return { alert, sidemenu };
}

const connectedNotFound = connect(mapStateToProps)(NotFound);
export { connectedNotFound as NotFound };