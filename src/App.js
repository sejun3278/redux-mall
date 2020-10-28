import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as testAction from './Store/modules/test';
import { Route, Link, Switch } from 'react-router-dom';

import { Header, Signup } from './page';

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
            <Route path='/signup' component={Signup} />
          </div>
          <div id='body_div_right'> </div>
        </div>
      </div>
    )
  }
}

App.defaultProps = {
  num : 0
}

export default connect(
  (state) => ({
    num : state.test.num,
    server : state.test.server,
    db : state.test.db
  }), 
  (dispatch) => ({
      testAction : bindActionCreators(testAction, dispatch)
  })
)(App);