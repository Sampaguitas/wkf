import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../assets/logo.jpg"; //logo.svg
import icon from "../../assets/icon.svg";
import Item from "./item.js"
import "./side-bar-menu.scss"
import _ from "lodash";

export default class SideBarMenu extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            show: "",
            listMenu: [
                { id: 0, title: "Stock", href: "/", icon: "warehouse" },
                { id: 1, title: "Buy Out", href: "/buy_out", icon: "shopping-cart" }
            ]
        }
        this.handleItemOver = this.handleItemOver.bind(this);
    }

    handleItemOver(event, title){
        event.preventDefault();
        this.setState({ show: title });
    }

    generateMenu() {
        const { listMenu, show } = this.state;
        const { menuItem, sidemenu } = this.props;
        let tempArray = []

        listMenu.map(item => {
            tempArray.push(
                <Item item={item} key={item.id} menuItem={menuItem} sidemenu={sidemenu} show={show} handleItemOver={this.handleItemOver}/>
            );
        });
        
        return tempArray;
    }

    render() {
        const { sidemenu } = this.props;
        return (
            <div>
                {localStorage.getItem("user") !== null && 
                    <div id="sidebar-menu" className={sidemenu.collapsed ? "collapsed" : undefined}>
                        <NavLink to={{ pathname: "/" }} tag="div" className="sidebar-logo">
                            <img src={sidemenu.collapsed ? icon : logo} />
                        </NavLink>
                        <ul className="default-list menu-list">
                            {this.generateMenu()}
                        </ul>
                        <button className="collapse-btn" onClick={this.props.toggleCollapse}>
                        <FontAwesomeIcon icon="arrows-alt-h" name="arrows-alt-h" />
                        </button>

                    </div>
                }
            </div>
        );
    }
}