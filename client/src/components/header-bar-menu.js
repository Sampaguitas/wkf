import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/header-bar-menu.css"

export default class HeaderBarMenu extends React.Component {
    render() {
        var isAdmin = false;
        try{
            isAdmin = JSON.parse(localStorage.getItem("user")).isAdmin;
        } catch(e){}
        const { collapsed } = this.props;
        return (
            <div>
                <div className = { collapsed || window.screen.availWidth < 1026 ? "header-bar-menu collapsed" : "header-bar-menu" } >
                    <nav className={collapsed || window.screen.availWidth < 1026 ? "navbar navbar-expand-lg navbar-light bg-light sticky-top collapsed" : "navbar navbar-expand-lg navbar-light bg-light sticky-top"} >
                        <span className={collapsed || window.screen.availWidth < 1026 ? "navbars collapsed small-hide" : "navbars"} onClick={this.props.toggleCollapse} >
                            <span><FontAwesomeIcon icon="bars" className="fa-lg"/></span>
                        </span>
                        <form className="form-inline ml-auto pull-right">
                            <NavLink to="/user">
                                <button className="btn btn-outline-leeuwen-blue btn-round" title="User-Page">
                                    <span><FontAwesomeIcon icon="user" className="fa-lg"/></span>
                                </button>
                            </NavLink>
                            {isAdmin &&
                                <NavLink to="/settings">
                                    <button className={"btn btn-outline-leeuwen-blue btn-round"} title="Settings">
                                        <span><FontAwesomeIcon icon="cog" className="fa-lg"/></span>
                                    </button>
                                </NavLink>
                            }
                            <NavLink to="/login">
                                <button className="btn btn-outline-leeuwen btn-round" title="Log-Out">
                                    <span><FontAwesomeIcon icon="sign-out-alt" className="fa-lg"/></span>
                                </button>
                            </NavLink>
                        </form>
                    </nav>
                </div>
            </div>  
        );
    }
}

