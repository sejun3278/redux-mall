import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as testAction from './Store/modules/test';

class App extends Component {

  componentDidMount() {
    this._getServerStatus();
    this._getDatabaseStatus();
  }

  _getServerStatus = async() => {
    const res = await axios.get('/data');

    this.props.testAction.check_server({ 'status' : res.data.result })
  }

  _getDatabaseStatus = async() => {
    const res = await axios.get('/get/db_data');

    this.props.testAction.check_db({ 'status' : res.data[0].string })
  }

  _changeNumber = (bool) => {
    const { testAction } = this.props;

    testAction.change_number({ 'bool' : bool })
  }

  render() {

    return(
      <div className='App'>
        <h1> Redux Test (자동 배포 중) </h1>
        <h3> 서버 상태 : {this.props.server}  </h3>
        <h3> DB 상태 : {this.props.db}  </h3>

        <div>
          <button onClick={() => this._changeNumber(true)}> + </button>
          　{ this.props.num }　
          <button onClick={() => this._changeNumber(false)}> - </button>
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