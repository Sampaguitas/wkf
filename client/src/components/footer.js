export default function Footer() {
    return (
        <div>
            <footer className="footer fixed-bottom bg-light" >
                <div className="text-right mr-5">
                    <span className="text-muted no-select">
                        © {(new Date().getFullYear())} - Van Leeuwen Pipe and Tube. All rights reserved (v{process.env.REACT_APP_VERSION}) - {process.env.NODE_ENV}
                    </span>
                </div>
            </footer>
        </div>
    );
}