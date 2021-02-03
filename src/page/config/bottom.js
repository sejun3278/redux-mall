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
            <div id='bottom_div' className='font_13'>
              <div> <b> 세준몰 (Sejun's Mall) </b> </div>

              <div id='bottom_stack_grid_div'> 
                <div className='bottom_stack_grid'> 
                  <div> 사용 스택　|　</div>
                  <div className='gray'> 
                    <div> Frontend : Redux (90%), jQuery (10%), CSS </div>
                    <div> Backend : Node.js (Express) </div>
                  </div>
                </div>

                <div className='bottom_stack_grid'> 
                  <div> 진행 기간　|　</div>
                  <div> 2020.11 ~ 2021.02 </div>
                </div>
              </div>
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