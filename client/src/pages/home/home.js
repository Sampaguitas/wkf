import React from "react";
import { connect } from "react-redux";


class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            menuItem: "Home"
        }
    }

    render() {
        return(
            <div>
                <h1>home</h1>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    return { alert, sidemenu };
}

const connectedHome = connect(mapStateToProps)(Home);
export { connectedHome as Home };