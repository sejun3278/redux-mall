import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';
// import '../../css/responsive/signup.css';

import img from '../../source/img/img.json';
import icon from '../../source/img/icon.json';
class Bottom extends Component {

    render() {
        return(
            <div id='bottom_div'>

                dafasdfsdfsadfasdf
            </div>
        )
    }
}

Bottom.defaultProps = {
}

export default connect(
  (state) => ({
  }), 

  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Bottom);