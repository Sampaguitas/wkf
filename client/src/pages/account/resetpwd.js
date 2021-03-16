import React from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sidemenuActions } from "../../_actions";
import InputIcon from "../../components/input-icon";
import logo from "../../assets/logo.jpg";
import rdb from "../../assets/rdb.svg";

export default class ResetPwd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        user: {
            userId: "",
            token: "",
            newPassword: "",
        },
        resetting: false,
        alert: {
          type: "",
          message: ""
        }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  componentDidMount() {
    const { location, dispatch } = this.props;
    const { user } = this.state;
    var qs = queryString.parse(location.search);
    if (qs.id && qs.token) {
        this.setState({
            user: {
                ...user,
                userId: qs.id,
                token: qs.token
            }
        });
    }
    localStorage.removeItem("user");
    dispatch(sidemenuActions.restore());
  }

  handleChange(event) {
    const { user } = this.state;
    const { name, value } = event.target;
    this.setState({
        user: {
            ...user,
            [name]: value
        }
    });
  }

  handleReset(event) {
    event.preventDefault();
    const { user, resetting } = this.state;
    if (!!user.userId && !!user.token && !!user.newPassword && !resetting) {
      this.setState({
        resetting: true
      }, () => {
        const requestOptions = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user)
        };
        return fetch(`${process.env.REACT_APP_API_URI}/account/resetPwd`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            resetting: false,
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
    const { user, resetting } = this.state;
    const alert = this.state.alert.message ? this.state.alert : this.props.alert;
    return (
      <div
        id="resetpwd-card"
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
              <p>Type you new password.</p>
              <form
                  name="form"
                  onSubmit={this.handleReset}
              >
                  <InputIcon
                      title="New Password"
                      name="newPassword"
                      type="password"
                      value={user.newPassword}
                      onChange={this.handleChange}
                      placeholder="New Password"
                      icon="lock"
                      resetting={resetting}
                      autoComplete="new-password"
                      required
                  />
                  <hr />
                  <button type="submit" className="btn btn-sm btn-block btn-leeuwen">
                    <span><FontAwesomeIcon icon={resetting ? "spinner" : "hand-point-right"} className={resetting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Reset</span>
                  </button>
                  <NavLink to={{ pathname: "/login" }} className="btn btn-link" tag="a">Go back to login page</NavLink>
                  <br />
                  {alert.message && <div className={`alert ${alert.type}`}>{alert.message}</div>}
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

const connectedResetPwd = connect(mapStateToProps)(ResetPwd);
export { connectedResetPwd as ResetPwd };
