import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as testAction from './Store/modules/test';
import { Route, Link, Switch } from 'react-router-dom';
import { Food, Movie, Game } from './page'

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
        Sejun's mall (test)
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