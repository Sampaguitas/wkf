import React from "react";
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Layout from "../../../components/layout";
import _ from "lodash";

export default class Params extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuItem: "Params",
            alert: {
                type: "",
                message: ""
            }
        };
        this.handleClearAlert = this.handleClearAlert.bind(this);
    }

    handleClearAlert(event) {
        event.preventDefault();
        this.setState({
            alert: {
                type: "",
                message: ""
            }
        });
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem } = this.state;

        return (
            <Layout collapsed={collapsed} toggleCollapse={toggleCollapse} menuItem={menuItem}>
                <div className="container full-height" style={{overflowY: "auto"}}>
                <div className="row equal" style={{height: "100%"}}>
                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/pffs",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>PFF Types</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/steels",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Steel Types</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/specs",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Specs</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/types",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Article Types</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/searchtypes",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Search Types</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/grades",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Grades</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/sizes",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Sizes</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/walls",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Walls</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/lengths",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Lengths</span>
                            </NavLink>
                        </div>

                        <div className="col-xs-6 col-sm-4">
                            <NavLink to={{ 
                                    pathname: "/surfaces",
                                }} className="navlink-card" tag="a"
                            >
                                    <span>Coatings</span>
                            </NavLink>
                        </div>

                    </div>                    
                </div>
                {/* {alert.message &&
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times" /></span>
                        </button>
                    </div>
                }

                <div id="params" className={alert.message ? "main-section-alert" : "main-section"}>
                    
                </div> */}
            </Layout>
        );
    }
}
