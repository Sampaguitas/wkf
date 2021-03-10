import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Login from "../pages/account/login";
import Home from "../pages/home/home";
import NotFound from "../pages/account/notfound";

export default () => {
  let user = localStorage.getItem("user");
  return (
    <div className="App">
      <Router>
          <Switch>
              <Route path="/login" children={<Login />} />
              <PrivateRoute exact path="/" children={<Home user={user}/>} />
              <Route path="*" children={<NotFound />} />
          </Switch>
      </Router>
    </div>
  );
}

function PrivateRoute ({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => 
        children.user ? (
          <children {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  ); 
}