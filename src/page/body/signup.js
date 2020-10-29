import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';
import { Route, Link, Switch } from 'react-router-dom';

import signup_info from '../../config/info';
import '../../css/responsive/signup.css';

import $ from 'jquery';

class Signup extends Component {

  _signupCheck = (event) => {
    const arr = ['id', 'nick', 'pw', 'pw_check', 'agree'];

    arr.forEach( (el) => {
      let agree;
      if(el === 'agree') {
        agree = this.props.agree;
      }

      this._eachCheck(String(el), true, agree);
    })
    
    event.preventDefault();
  }

  _alert = (target, ment) => {
    const { alert_obj, signupAction } = this.props;
    let cover_obj = alert_obj;

    const target_el = '#signup_' + target + '_input';
    const target_li = $(target_el).parent()[0];
    const target_id = 'alert_' + target;

    if(cover_obj[target] === false) {
      $(target_el).addClass('red_alert');
      $(target_li).append('<p class="alert red_alert" id=' + target_id +'> ' + ment + ' </p>')
    }
    cover_obj[target] = true;

    return signupAction.set_alert(cover_obj)
  }

  _eachCheck = (type, mode, agree) => {
    const data = $('#signup_' + type + '_input').val();
    this._removeAlert(type);

    if(type !== 'agree') {
      if(data.length === 0 && !mode) {
        return this._removeAlert(type);
      }
    }

    if(type === 'id') {
      const id_check = /^[a-z]+[a-z0-9]{5,14}$/g; // 아이디 체크

      if(!id_check.test(data)) {
        this._alert(type, '영문자로 시작하는 6~15 글자 사이의 영문 또는 숫자를 입력해주세요.')
      }

    } else if(type === 'nick') {
      if(data.length < 3 || data.length > 10) {
        this._alert(type, '최소 3글자 이상, 10글자 이하로 입력해주세요.')
      }

    } else if(type === 'pw' || type === 'pw_check') {
      const pass_check = /^[a-z]+[a-z0-9]{5,19}$/g; // 비밀번호 체크

      if(!pass_check.test(data)) {
        return this._alert(type, '영문자로 시작하는 6~20 글자 사이의 영문 또는 숫자를 입력해주세요.');
      }

      let compare;
      if(type === 'pw') {
        compare = $('#signup_pw_check_input').val();
      
      } else if(type === 'pw_check') {
        compare = $('#signup_pw_input').val();
      }

      if(data !== compare) {
        this._alert('pw', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        this._alert('pw_check', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');

      } else {
        this._removeAlert('pw');
        this._removeAlert('pw_check');
      }

    } else if(type === 'agree') {
      if(!agree) {
        this._alert('agree', '이용약관에 동의해주세요.');
        $('#signup_agree_input').css({ 'color' : 'black' })

      } else {
        $('#signup_agree_input').css({ 'color' : '#1785ff' })
      }
    }

  }

  _removeAlert(target) {
    const { alert_obj, signupAction } = this.props;
    const el_target = $('#alert_' + target);
    let cover_obj = alert_obj;

    el_target.remove();
    cover_obj[target] = false;

    $('#signup_' + target + '_input').removeClass('red_alert')
    
    return signupAction.set_alert(cover_obj)
  }

  _mouseToggle = (bool) => {
    if(bool) {
      $('#signup_submit_button').css({ 'backgroundColor' : '#3d7ea6', 'color' : 'white' })

    } else {
      $('#signup_submit_button').css({ 'backgroundColor' : 'white', 'color' : 'black' })

    }
  }

  _inputInfo = (type) => {
    const { signupAction, id, nick, pw, pw_check } = this.props;
    const data = $('#signup_' + type + '_input').val();
    const agree = $('#agree_info_button').is(":checked");

    let result = {
      id : id,
      nick : nick,
      pw : pw,
      pw_check : pw_check,
      agree : agree
    };

    if(type === 'id') {
      result.id = data;

    } else if(type === 'nick') {
      result.nick = data;

    } else if(type === 'pw') {
      result.pw = data;

    } else if(type === 'pw_check') {
      result.pw_check = data;

    } else if(type === 'agree') {
      result.agree = !agree;
    }

    signupAction.input_info(result);
    return this._eachCheck(type, null, result.agree);
  }

  render() {
    const { id, nick, pw, pw_check, agree, alert_obj } = this.props;

    return(
      <div id='signup_div'>
        <div> </div>
        
        <div id='signup_info_div' className='bold'> 
          <ul className='list_none'>
            <form id='signup_form'>
            <li className='signup_li' id='signup_id_li'>
              <p> 아이디 </p>
              <input id='signup_id_input' type='text' placeholder='15 글자 이내의 영문 입력' maxLength='15'
                value={id} onChange={() => this._inputInfo('id')}
              />
            </li>

            <li className='signup_li' id='signup_nick_li'> 
              <p> 닉네임 </p>
              <input id='signup_nick_input' type='text' placeholder='10 글자 이내의 영문 및 한글 입력' maxLength='10'
                value={nick} onChange={() => this._inputInfo('nick')}
              />
            </li>

            <li className='signup_li' id='signup_pw_li'> 
              <p> 비밀번호 </p>
              <input id='signup_pw_input' autoComplete="true" type='password' maxLength='20'
                value={pw} onChange={() => this._inputInfo('pw')}
              />
            </li>

            <li className='signup_li' id='signup_pw_check_li'> 
              <p> 비밀번호 확인 </p>
              <input id='signup_pw_check_input' autoComplete="true" type='password' maxLength='20'
                value={pw_check} onChange={() => this._inputInfo('pw_check')}
              />
            </li>

            <input type='submit' id='signup_submit_button' className='pointer' value='다음' 
                  onClick={this._signupCheck} onMouseOver={() => this._mouseToggle(true)}      
                  onMouseLeave={() => this._mouseToggle(false)}
            />
            </form>
          </ul>
        </div>

        <div id='signup_center_height_line'> </div>
        <div id='signup_agree_div'> 
          <h4> 이용약관 동의 </h4>

          <textarea readOnly className='no_resize' defaultValue={signup_info} />

          <p id='signup_argee_checkbox_div'>
            <input type='checkbox' id='agree_info_button' className='check_custom_1'
                   defaultChecked={agree}
            />

            <span className='check_toggle_1'> </span>
            <label htmlFor='agree_info_button' className='pointer' id='signup_agree_input'
                   onClick={() => this._inputInfo('agree')}
            > 
              이용약관에 동의합니다. 
            </label>
          </p>
        </div>
      </div>
    )
  }
}

Signup.defaultProps = {
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
)(Signup);