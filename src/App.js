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
    this._getAllState();
  }

  _getAllState = async() => {
    const res = await axios.get('/get/allState');

    let result = {};
    result.server = res.data.server_state;
    result.db = res.data.db_state;

    this.props.testAction.all_state( result )
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



        <div style={{ 'marginTop' : '80px' }}>
          <h4> What Do You Like ? </h4>

          <ul id='like_list'>
            <li id='list_list_title'> 
              <Link to='/food'> Food </Link> 
              <ul style={{  'listStyle' : 'none', 'marginLeft' : '60px' }}>
                <li> <Link to='/food/Hamburger'> Hamburger </Link> </li>
                <li> <Link to='/food/Ice Cream'> Ice Cream </Link> </li>
                <li> <Link to='/food/Pizza'> Pizza </Link> </li>
              </ul>
            </li>

            <li> 
              <Link to='/game'> Game </Link> 
              <ul style={{  'listStyle' : 'none', 'marginLeft' : '60px' }}>
                <li> <Link to='/game?name=Warcraft'> Warcraft </Link> </li>
                <li> <Link to='/game?name=League of Legends'> League of Legends </Link> </li>
                <li> <Link to='/game?name=Fall Guys'> Fall Guys </Link> </li>
              </ul>
            </li>
            <li> <Link to='/movie'> Movie </Link> </li>
          </ul>

          <h4> My Answer is : 
            <Switch>
              <Route path="/food/:name/:two" component={Food} />
              <Route path="/food/:name" component={Food} />
              <Route path="/food" component={Food} />

              <Route path="/game" component={Game} />
              <Route path="/movie" component={Movie} />
            </Switch>
          </h4>
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