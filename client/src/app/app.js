import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";

import Login from "../pages/account/login";
import ReqPwd from "../pages/account/reqpwd";
import ResetPwd from "../pages/account/resetpwd";
import NotFound from "../pages/account/notfound";
import Settings from "../pages/account/settings";
import User from "../pages/account/user";
import Stock from "../pages/home/stock";
import BuyOut from "../pages/home/buyout";
import Export from "../pages/home/export";
import Import from "../pages/home/import";

import Params from "../pages/home/params/params";
import Pffs from "../pages/home/params/pffs";
import Specs from "../pages/home/params/specs";
import Steels from "../pages/home/params/steels";
import Types from "../pages/home/params/types";
import Searchtypes from "../pages/home/params/searchtypes";
import Grades from "../pages/home/params/grades";
import Surfaces from "../pages/home/params/surfaces";
import Lengths from "../pages/home/params/lengths";

library.add(fas, far, fal);

export default class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    }
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({ collapsed: !collapsed });
  }
  
  render() {
    let user = localStorage.getItem("user");
    let {collapsed} = this.state;
    return (
      <Router>
          <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/reqpwd">
                <ReqPwd />
              </Route>
              <Route path="/resetpwd">
                <ResetPwd />
              </Route>
              <PrivateRoute exact path="/" user={user}>
                <Stock user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/buyout" user={user}>
                <BuyOut user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/import" user={user}>
                <Import user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/export" user={user}>
                <Export user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/user" user={user}>
                <User user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/settings" user={user}>
                <Settings user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/params" user={user}>
                <Params user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/pffs" user={user}>
                <Pffs user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/steels" user={user}>
                <Steels user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/specs" user={user}>
                <Specs user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/types" user={user}>
                <Types user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/searchtypes" user={user}>
                <Searchtypes user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/grades" user={user}>
                <Grades user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/surfaces" user={user}>
                <Surfaces user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <PrivateRoute exact path="/lengths" user={user}>
                <Lengths user={user} collapsed={collapsed} toggleCollapse={this.toggleCollapse}/>
              </PrivateRoute>
              <Route path="*">
                <NotFound />
              </Route>
          </Switch>
      </Router>
    );
  }
}

function PrivateRoute({ children, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        user ? (
          children
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