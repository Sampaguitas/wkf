import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/logo.jpg";//logo.svg
import icon from "../assets/icon.svg";
import Item from "./side-bar-item.js"
import "../styles/side-bar-menu.scss"

export default class SideBarMenu extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            show: "",
            listMenu: [
                { id: 0, title: "Stock", href: "/", icon: "warehouse" },
                { id: 1, title: "Buy Out", href: "/buyout", icon: "shopping-cart" },
                { id: 2, title: "Process", href: "/process", icon: "history" }
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
        const { menuItem } = this.props;
        let tempArray = []

        listMenu.map(item => {
            return tempArray.push(
                <Item item={item} key={item.id} menuItem={menuItem} show={show} handleItemOver={this.handleItemOver}/>
            );
        });
        
        return tempArray;
    }

    render() {
        const { collapsed } = this.props;
        return (
            <div>
                {localStorage.getItem("user") !== null && 
                    <div id="sidebar-menu" className={collapsed ? "collapsed" : undefined}>
                        <NavLink to={{ pathname: "/" }} tag="div" className="sidebar-logo">
                            <img alt="logo" src={collapsed ? icon : logo} />
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