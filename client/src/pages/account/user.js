import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import authHeader from "../../helpers/auth-header";
import Layout from "../../components/layout";

export default class User extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            newPwd: "",
            alert: {
                type: "",
                message: ""
            },
            show: false,
            loading: false,
            updating: false,
            menuItem: ""
        }
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.togglePassword = this.togglePassword.bind(this);
    }

    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('user'));
        if (!!user && !!user._id) {
            this.setState({
                loading: true
            }, () => {
                const requestOptions = {
                    method: "GET",
                    headers: {...authHeader(), "Content-Type": "application/json"},
                };
                return fetch(`${process.env.REACT_APP_API_URI}/api/search/users/${user._id}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        loading: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                        localStorage.removeItem("user");
                        window.location.reload(true);
                            } else if (response.status !== 200) {
                            this.setState({
                                alert: {
                                    type: "alert-danger",
                                    message: resMsg
                                }
                            });
                        } else {
                            this.setState({
                                user: data.user
                            });
                        }
                    });
                }).catch( () => {
                    localStorage.removeItem("user");
                    window.location.reload(true);
                }));
            });
        } else {
            localStorage.removeItem("user");
            window.location.reload(true);
        }
    }

    handleClearAlert(event){
        event.preventDefault();
        this.setState({
          alert: {
            type: "",
            message: ""
          }
        });
    }

    handleChange(event){
        const { name, type, checked, value } = event.target;
        this.setState({ [name]: type === "checkbox" ? checked : value });
    }

    togglePassword(event) {
        event.preventDefault();
        const { show } = this.state;
        this.setState({show: !show });
    }

    handleSubmit(event){
        event.preventDefault();
        const { newPwd } = this.state
        if (newPwd) {
            this.setState({
                updating: true
                }, () => {
                const requestOptions = {
                    method: "PUT",
                    headers: {...authHeader(), "Content-Type": "application/json"},
                    body: JSON.stringify({ newPwd })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/api/user/updatePwd`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({ updating: false }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            // Unauthorized
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else {
                            this.setState({
                                newPwd: "",
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                }
                            });
                        }
                    });
                }))
                .catch( () => {
                    localStorage.removeItem("user");
                    window.location.reload(true);
                });
            });
        }
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, user, updating, menuItem, newPwd, show } = this.state;
        return (
            <Layout collapsed={collapsed} toggleCollapse={toggleCollapse} menuItem={menuItem}>
                {alert.message && 
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                        </button>
                    </div>
                }
                <div id="user" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 mb-3">
                            <div className="card">
                                <div className="card-header">Profile Info</div>
                                <div className="card-body" style={{height: "118.719px"}}>
                                    <address style={{fontSize: "14px"}}>
                                        <strong>{!user.hasOwnProperty("name") ?  <Skeleton/> : `${user.name}`} </strong>
                                        <br/>
                                        {!user.hasOwnProperty("email") ? <Skeleton/> : <a href={`mailto:${user.email}`}>{user.email}</a>}
                                        <br/>
                                        {!user.hasOwnProperty("isAdmin") ? <Skeleton/> : user.isAdmin ? "Admin" : "Regular User"}
                                    </address>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 mb-3"> 
                            <div className="card">
                                <div className="card-header">Change Password</div>
                                <div className="card-body" style={{height: "118.719px"}}>
                                    <form
                                        onSubmit={this.handleSubmit}
                                    >
                                        <div className="form-group">
                                            <div className="input-group input-group-lg input-group-sm">
                                                <input
                                                    className="form-control"
                                                    id="newPwd"
                                                    name="newPwd"
                                                    type={show ? "text" : "password"}
                                                    value={newPwd}
                                                    onChange={this.handleChange}
                                                    placeholder="New Password"
                                                    required={true}
                                                    autoComplete="new-password"
                                                />
                                                <div className="input-group-append">
                                                    <div type="button" className="input-group-text" onClick={event => this.togglePassword(event)}>
                                                        <FontAwesomeIcon icon={show ? "eye-slash" : "eye" }/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 text-right p-0">
                                            <button type="submit" className="btn btn-sm btn-leeuwen-blue">
                                                <span><FontAwesomeIcon icon={updating ? "spinner" : "hand-point-right"} className={updating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Submit</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}