import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputIcon from "../../components/input-icon";
import logo from "../../assets/logo.jpg"; //logo.svg
import rdb from "../../assets/rdb.svg";

export default class ReqPwd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      requesting: false,
      menuItem: "",
      alert: {
        type: "",
        message: ""
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
  }

  componentDidMount() {
    localStorage.removeItem("user");
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  handleRequest(event) {
    event.preventDefault();
    const { email, requesting } = this.state;
    if (!!email && !requesting) {
      this.setState({
        requesting: true
      }, () => {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({email})
        };
        return fetch(`${process.env.REACT_APP_API_URI}/api/users/reqPwd`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            requesting: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
              localStorage.removeItem("user");
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
        }));
      });
    }
  }

  render() {
    const { alert, email, requesting } = this.state;
    return (
      <div
        id="requestpwd-card"
        className="row justify-content-center align-self-center"
      >
      <div className="card card-login">
          <div className="card-body">
              <img
                  src={logo}
                  className="img-fluid"
                  alt="Van Leeuwen Pipe and Tube"
              />
              <br />
              <img src={rdb} className="img-fluid mt-2" alt="Reconciliation Database" />
              <hr />
              <p>Please provide your email address and we"ll send you instructions on how to change your password.</p>
              <form
                  name="form"
                  onSubmit={this.handleRequest}
              >
                  <InputIcon
                    title="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={this.handleChange}
                    placeholder="Email"
                    icon="user"
                    requesting={requesting}
                    autoComplete="email"
                  />
                  <hr />
                  <button type="submit" className="btn btn-sm btn-block btn-leeuwen">
                    <span><FontAwesomeIcon icon={requesting ? "spinner" : "hand-point-right"} className={requesting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Submit</span>
                  </button>
                  <NavLink to={{ pathname: "/login" }} className="btn btn-link btn-sm" tag="a"> Go back to login page</NavLink>
                  <br />
                  {alert.message && <div className={`alert ${alert.type}`}>{alert.message}</div>}
              </form>
              </div>
          </div>
      </div>
    );
  }
}