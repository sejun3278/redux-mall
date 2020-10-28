import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as testAction from '../../Store/modules/test';
import { Route, Link, Switch } from 'react-router-dom';

import signup_info from '../../config/info';

class Signup extends Component {

  render() {

    return(
      <div id='signup_div'>
        <div> </div>

        <div id='signup_info_div' className='bold'> 
          <ul className='list_none'>
            <form>
            <li> 
              <p> 아이디 </p>
              <input id='signup_id_input' type='text' placeholder='10 글자 이내의 영문 입력' maxLength='10'/>
            </li>

            <li> 
              <p> 닉네임 </p>
              <input id='signup_nick_input' type='text' placeholder='10 글자 이내의 영문 및 한글 입력' maxLength='10'/>
            </li>

            <li> 
              <p> 비밀번호 </p>
              <input id='signup_pw_input' type='password' maxLength='20'/>
            </li>

            <li> 
              <p> 비밀번호 확인 </p>
              <input id='signup_pw_check_input' type='password' maxLength='20'/>
            </li>
          </form>

          </ul>
        </div>

        <div id='signup_center_height_line'> </div>
        <div id='signup_agree_div'> 
          <h4> 이용약관 동의 </h4>

          <textarea readOnly className='no_resize' defaultValue={signup_info} />

          <p id='signup_argee_checkbox_div'>
            <input type='checkbox' id='agree_info_button' className='check_custom_1' />
            <span className='check_toggle_1'> </span>
            <label htmlFor='agree_info_button' className='pointer'> 이용약관에 동의합니다. </label>
          </p>
        </div>

        <div id='signup_agree_mobile_div'>
          2
        </div>
      </div>
    )
  }
}

Signup.defaultProps = {
  num : 0
}

export default connect(
  (state) => ({
    num : state.test.num
  }), 
  (dispatch) => ({
      testAction : bindActionCreators(testAction, dispatch)
  })
)(Signup);