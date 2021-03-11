import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Login from "../pages/account/login";
import Home from "../pages/home/home";
import NotFound from "../pages/account/notfound";

class App extends React.Component {
  render() {
    let user = localStorage.getItem("user");
    return (
      <Router>
          <Switch>
              <Route path="/login" children={<Login />} />
              <PrivateRoute exact path="/" children={<Home user={user}/>} />
              <Route path="*" children={<NotFound />} />
          </Switch>
      </Router>
    );
  }
}

function PrivateRoute ({ children, ...rest }) {
  //source: https://reactrouter.com/web
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

export default App;

