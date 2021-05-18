import { useLocation } from "react-router-dom";

export default function NotFound() {
    let location = useLocation();
    return (
        <div className="container full-height" style={{overflowY: "auto"}}>
            <section className="card-login">
                <h2>#404 Page Not Found</h2>
                <hr />
                <p>The requested URL <code>{location.pathname}</code> could not found be on this server.</p>
            </section>
        </div>
    );
}