import React, { Component } from "react";
import HeaderBarMenu from "./header-bar-menu";
import SideBarMenu from "./side-bar-menu/side-bar-menu";
import Footer from "./footer.js";
// import "../_styles/bootstrap.min.css";

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const { menuItem, sidemenu, toggleCollapse } = this.props;
        return (
            <div className="full-height">
                <div className="full-height">
                    <HeaderBarMenu id="headerbar" className={sidemenu.collapsed ? "collapsed" : ""} sidemenu={sidemenu} toggleCollapse={toggleCollapse}/>
                    <SideBarMenu className={sidemenu.collapsed ? "collapsed" : ""} menuItem={menuItem} sidemenu={sidemenu} toggleCollapse={toggleCollapse}/>
                    <div id="content" className={sidemenu.collapsed ? "collapsed" : ""} style={{height: `calc(100% - 100px)`}}>
                        {this.props.children}
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}