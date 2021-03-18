import React from "react";
import Layout from "../../components/layout";

export default class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuItem: "Stock"
        }
    }

    render() {
        const { menuItem } = this.state;
        const { toggleCollapse, collapsed } = this.props;
        return(
            <Layout collapsed={collapsed} toggleCollapse={toggleCollapse} menuItem={menuItem}>

            </Layout>
        );
    }
}