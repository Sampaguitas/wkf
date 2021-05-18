import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputIcon from "../../components/input-icon";
import logo from "../../assets/logo.jpg";
import rdb from "../../assets/rdb.svg";

class ResetPwd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        user: {
            userId: "",
            token: "",
            newPwd: "",
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
    const { location } = this.props;
    const { user } = this.state;
    console.log(location.search);
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
    console.log("user.userId:", user.userId);
    console.log("user.token:", user.token);
    console.log("user.newPwd:", user.newPwd);
    console.log("resetting:", resetting);
    if (!!user.userId && !!user.token && !!user.newPwd && !resetting) {
      
      this.setState({
        resetting: true
      }, () => {
        const requestOptions = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: user.token,
            newPwd: user.newPwd
          })
        };
        return fetch(`${process.env.REACT_APP_API_URI}/server/users/resetPwd/${user.userId}`, requestOptions)
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
    const { alert, user, resetting } = this.state;
    return (
      <div className="container full-height" style={{overflowY: "auto"}}>
        <section className="card-login"> {/*  shadow p-3 mb-5 bg-body rounded */}
          <img src={logo} className="img-fluid" alt="Van Leeuwen Pipe and Tube"/>
          <img src={rdb} className="img-fluid mt-2" alt="European Stock Management (ESM)" />
          <hr />
          <p>Type you new password.</p>
          <form
            name="form"
            onSubmit={this.handleReset}
          >
            <InputIcon
                title="New Password"
                name="newPwd"
                type="password"
                value={user.newPwd}
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
        </section>
      </div>
    );
  }
}

export default withRouter(ResetPwd);