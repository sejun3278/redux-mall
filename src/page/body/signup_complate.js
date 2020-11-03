import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';
import '../../css/responsive/signup.css';

const Signup_complate = (props) => {
      const { _pageMove, _modalToggle } = props;
      const id = props.match.params.id;

      if(id !== undefined) {
        return(
            <div id='signup_complate_div'>
              <h3> 회원가입 완료 </h3>

              <p> <b> {id} </b> 님의 회원가입을 환영합니다 !! </p>

              <div id='signup_complate_select_div'>
                <div onClick={() => _pageMove('replace', '/')}> <u className='remove_underLine pointer'> 홈으로 </u></div>
                <div>
                  <u className='remove_underLine pointer'
                     onClick={() => _modalToggle(true)}
                  > 
                    로그인 
                  </u> 
                </div>
              </div>
            </div>
        )

        } else {
          return;
        }
    }

Signup_complate.defaultProps = {
    id : "",
    nick : "",
    pw : "",
    pw_check : "",
  }
  
  export default connect(
    (state) => ({
      id : state.signup.id,
      nick : state.signup.nick,
      pw : state.signup.pw,
      pw_check : state.signup.pw_check,
      agree : state.signup.agree,
      alert_obj : state.signup.alert_obj
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Signup_complate);