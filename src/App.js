import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Route, Link, Switch } from 'react-router-dom';

import Header from './page/header';
import Signup from './page/body/signup';
import User_info from './page/body/userinfo';
import Signup_complate from './page/body/signup_complate';


class App extends Component {

  componentDidMount() {
    this._callServerStatus();
  }

  _callServerStatus = async() => {
    const res = await axios.get('https://sejun-redux-server.herokuapp.com/test');
    console.log(res)
  }

  render() {

    return(
      <div className='App'>
        <Header />

        <div id='body_div'>
          <div id='body_div_left'> </div>
          <div id='body_div_center'>
            <Switch>
              <Route path='/signup/complate' component={Signup_complate} />
              <Route path='/signup' component={Signup} />
            </Switch>
          </div>
          <div id='body_div_right'> </div>
        </div>
      </div>
    )
  }
}

App.defaultProps = {
}

export default connect(
  (state) => ({
  }), 
  (dispatch) => ({
  })
)(App);