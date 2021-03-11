import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

//Redux
import { connect } from "react-redux";
import { history } from "../_helpers";
import { alertActions } from "../_actions";

import {Login} from "../pages/account/login";
import {Home} from "../pages/home/home";
import {NotFound} from "../pages/account/notfound";

//Icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
library.add(fas, far, fal);



class App extends React.Component {
  
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    history.listen((location, action) => {
        dispatch(alertActions.clear());
    });
  }

  render() {
    let user = localStorage.getItem("user");
    return (
      <Router>
          <Switch>
              <Route path="/login" component={Login} user={user}/>
              <PrivateRoute exact path="/" component={Home} user={user}/>
              <Route path="*" component={NotFound} />
          </Switch>
      </Router>
    );
  }
}

function PrivateRoute({ component, user, ...rest }) {
  //source: https://reactrouter.com/web
  return (
    <Route
      {...rest}
      render={props => 
        user ? (
          <component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  ); 
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
      alert
  };
}

const connectedApp = connect(mapStateToProps)(App);
export { connectedApp as App };

