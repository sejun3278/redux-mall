import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';
// import '../../css/responsive/signup.css';

import img from '../../source/img/img.json';
import icon from '../../source/img/icon.json';
class Loading extends Component {

    render() {
        return(
            <div className='loading_div'>
                <div style={{ 'backgroundImage' : `url(${img.img.loading})`  }} />

                <div>
                    <img src={icon.icon.reload} className='pointer' id='loading_reload_icon' onClick={() => window.location.reload()}/>
                    <b className='pointer' onClick={() => window.location.reload()}> 새로 고침 </b>
                </div>
            </div>
        )
    }
}

Loading.defaultProps = {
}

export default connect(
  (state) => ({
  }), 

  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Loading);