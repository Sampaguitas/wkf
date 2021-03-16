import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

//Redux
import { connect } from "react-redux";
import { history } from "../_helpers";
import { alertActions } from "../_actions";

import {Login} from "../pages/account/login";
import {ReqPwd} from "../pages/account/reqpwd";
import {ResetPwd} from "../pages/account/resetpwd";
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
              <Route path="/login" component={Login} user={user} />
              <Route path="/reqpwd" component={ReqPwd} user={user} />
              <Route path="/resetpwd" component={ResetPwd} user={user} />
              <PrivateRoute exact path="/" component={Home} user={user} />
              <Route path="*" user={user} component={NotFound} />
          </Switch>
      </Router>
    );
  }
}

function PrivateRoute({ component: Component, user: User, ...rest }) {
  
  //source: https://reactrouter.com/web
  return (
    <Route
      {...rest}
      render={props =>
        User ? (
          <Component {...props} />
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

