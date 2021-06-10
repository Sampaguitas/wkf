import React from "react";
import HeaderBarMenu from "./header-bar-menu";
import SideBarMenu from "./side-bar-menu";
import Footer from "./footer.js";

export default class Layout extends React.Component {
    render() {
        const { menuItem, collapsed, toggleCollapse } = this.props;
        return (
            <div className="full-height">
                <div className="full-height">
                    <HeaderBarMenu id="headerbar" className={collapsed  || window.screen.availWidth < 1026 ? "collapsed" : ""} collapsed={collapsed} toggleCollapse={toggleCollapse}/>
                    <SideBarMenu className={collapsed  || window.screen.availWidth < 1026 ? "collapsed" : ""} menuItem={menuItem} collapsed={collapsed} toggleCollapse={toggleCollapse}/>
                        <div id="content" className={collapsed  || window.screen.availWidth < 1026 ? "collapsed" : ""} style={{height: `calc(100% - 100px)`}}>
                            {this.props.children}
                        </div>
                    <Footer />
                </div>
            </div>
        );
    }
}