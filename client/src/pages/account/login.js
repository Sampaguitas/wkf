import React from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { history } from "../../_helpers";
import { sidemenuActions } from "../../_actions";
import InputIcon from "../../components/input-icon";
import logo from "../../assets/logo.jpg";
import rdb from "../../assets/rdb.svg";

export default class Login extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          email: "",
          password: "",
          loggingIn: false,
          menuItem: "",
          alert: {
            type: "",
            message: ""
          }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        localStorage.removeItem("user");
        dispatch(sidemenuActions.restore());
    }
    
    handleChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }
    
    handleLogin(event) {
        event.preventDefault();
        const { email, password, loggingIn } = this.state;
        if (!!email && !!password && !loggingIn) {
            this.setState({
            loggingIn: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/user/login`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                    loggingIn: false,
                    }, () => {
                    const data = text && JSON.parse(text);
                    const resMsg = (data && data.message) || response.statusText;
                    if (response.status === 401) {
                        localStorage.removeItem("user");
                    } else if (!!data.token) {
                        localStorage.setItem("user", JSON.stringify(data));
                        history.push("/");
                        window.location.reload();
                    } else {
                        this.setState({
                        alert: {
                            type: response.status === 200 ? "alert-success" : "alert-danger",
                            message: resMsg
                        }
                        });
                    }
                    });
                }).catch( () => {
                    localStorage.removeItem("user");
                }));
            });
        }
    }

    render() {
        const { email, password, loggingIn } = this.state;
        let alert = this.state.alert.message ? this.state.alert : this.props.alert;
        return(
            <div id="login-card" className="row justify-content-center align-self-center">
                <div className="card card-login">
                    <div className="card-body">
                        <img src={logo} className="img-fluid" alt="Van Leeuwen Pipe and Tube"/>
                    <br />
                    <img src={rdb} className="img-fluid mt-2" alt="Reconciliation Database" />
                    <hr />
                    <form name="form" onSubmit={this.handleLogin}>
                        <InputIcon
                            title="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={this.handleChange}
                            placeholder="Email"
                            icon="user"
                            submitted={loggingIn}
                            autoComplete="email"
                        />
                        <InputIcon
                            title="Password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={this.handleChange}
                            placeholder="Password"
                            icon="lock"
                            submitted={loggingIn}
                            autoComplete="current-password"
                        />
                        <hr />
                        <button type="submit" className="btn btn-sm btn-block btn-leeuwen"> 
                            <span><FontAwesomeIcon icon={loggingIn ? "spinner" : "sign-in-alt"} className={loggingIn ? "fa-pulse fa fa-fw mr-2" : "fa mr-2"}/>Login</span>
                        </button>
                        <NavLink to={{ pathname: "/requestpwd" }} className="btn btn-link btn-sm" tag="a">Forgot your password?</NavLink>
                        <br />
                        {alert.message && (<div className={`alert ${alert.type}`}>{alert.message}</div>)}
                    </form>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    return { alert, sidemenu };
}
  
const connectedLogin = connect(mapStateToProps)(Login);
export { connectedLogin as Login };