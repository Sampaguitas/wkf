import { useLocation } from "react-router-dom";

export default () => {
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