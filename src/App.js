import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Route, Link, Switch } from 'react-router-dom';

import * as signupAction from './Store/modules/signup';

import Header from './page/header';
import Signup from './page/body/signup';
import Login from './page/body/login';
import SignupComplate from './page/body/signup_complate';

import URL from './config/url.js';

const customStyles = {
  content : {
    top                   : '230px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '400px',
    backgroundColor       : '#394867'
  }
};

Modal.setAppElement('body')

class App extends Component {
  componentDidMount() {
    this._callServerStatus();
  }

  _callServerStatus = async() => {
    const res = await axios.get(URL + '/test');
    console.log(res)
  }

  _pageMove = (type, location) => {
    // type
    // href = '뒤로가기 가능'
    // replace = '뒤로가기 불가'

    if(type === 'href') {
      return window.location.href = location;

    } else if(type === 'replace') {
      return window.location.replace(location);
    }
  }

  _modalToggle = (bool) => {
    const { signupAction } = this.props;

    return signupAction.modal_toggle({ 'bool' : bool })
  }

  render() {
    const { login_modal } = this.props;
    const { _pageMove, _modalToggle } = this;

    return(
      <div className='App'>
        <Header 
          _pageMove={_pageMove}
          _modalToggle={_modalToggle}
        />

        <div id='body_div'>
          <div id='body_div_left'> </div>
          <div id='body_div_center'>
            <Modal
              isOpen={login_modal}
              // onAfterOpen={afterOpenModal}
              onRequestClose={() => _modalToggle(false)}
              style={customStyles}
              // contentLabel="Example Modal"
            >
              <Login 
                _pageMove={_pageMove}
                _modalToggle={_modalToggle}
              />
            </Modal>

            <Switch>
              <Route path='/signup/complate/:id' 
                     render={(props) => <SignupComplate 
                        _pageMove={_pageMove} 
                        _modalToggle={_modalToggle}
                        {...props} 
                      />}
              />
              <Route exact path='/signup' component={Signup} />
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
    login_modal : state.signup.login_modal
  }), 
  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch)
  })
)(App);