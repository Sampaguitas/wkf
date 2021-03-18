import "../styles/footer.css";

export default function Footer() {
    return (
        <div>
            <footer className="footer fixed-bottom bg-light text-right" >
                    <span className="text-muted no-select footer-text mr-3">
                        © {(new Date().getFullYear())} - Van Leeuwen Pipe and Tube. All rights reserved (v0.1.0) - {process.env.NODE_ENV}
                    </span>
            </footer>
        </div>
    );
}