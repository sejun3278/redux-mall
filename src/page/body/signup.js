import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';

import signup_info from '../../config/info';
import '../../css/responsive/signup.css';
import img from '../../source/img/icon.json';
import URL from '../../config/url';

import $ from 'jquery';

class Signup extends Component {
  _signupCheck = async (event) => {
    const arr = ['id', 'nick', 'pw', 'pw_check', 'agree'];
    const { signupAction } = this.props;
    const { id, nick, pw } = this.props;

    let signup_allow = true;
    
    arr.forEach( (el) => {
      let agree;
      if(el === 'agree') {
        agree = this.props.agree;
      }

      let cover_signup_allow = this._eachCheck(String(el), true, agree);
      if(cover_signup_allow === false) {
        signup_allow = false;
      }
    })
    
    event.preventDefault();

    if(signup_allow) {
    signupAction.signup_allow({ 'bool' : true });
    const data = { id : id, nick : nick, pw : pw };

      const add_user = await axios(URL + '/add/signup', {
        method : 'POST',
        headers: new Headers(),
        data : data
      })

      if(add_user.data !== true) {
      signupAction.signup_allow({ 'bool' : false });

        if(add_user.data.id === false) {
          // 아이디 중복
          this._alert('id', '중복되는 아이디입니다.')
          return false;

        } else if(add_user.data.nick === false) {
          // 닉네임 중복
          this._alert('nick', '중복되는 닉네임입니다.')
          return false;
        }

      } else {
        // 1차 회원가입 완료
        sessionStorage.setItem('signup', true);
        return window.location.replace('/signup/complate/' + id)
      }
    }
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

    signupAction.set_alert(cover_obj)
    return false;
  }

  _eachCheck = async (type, mode, agree) => {
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
        return false;
      }

      const id_overlap_check = await axios(URL + '/check/user_id', {
        method : 'POST',
        headers: new Headers(),
        data : { id : data }
      })

      if(id_overlap_check.data === false) {
        this._alert(type, '중복되는 아이디입니다.')
        return false;
      }

    } else if(type === 'nick') {
      if(data.length < 3 || data.length > 10) {
        this._alert(type, '최소 3글자 이상, 10글자 이하로 입력해주세요.')
        return false;
      }

      const nick_overlap_check = await axios(URL + '/check/nickname', {
        method : 'POST',
        headers: new Headers(),
        data : { nick : data }
      })

      if(nick_overlap_check.data === false) {
        this._alert(type, '중복되는 닉네임입니다.')
        return false;
      }

    } else if(type === 'pw' || type === 'pw_check') {
      const pass_check = /^[A-za-z]+[a-z0-9]{7,19}$/g; // 비밀번호 체크

      if(!pass_check.test(data)) {
        this._alert(type, '영문자로 시작하는 8~20 글자 사이의 영문 또는 숫자를 입력해주세요.');
        return false;
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
        return false;

      } else {
        this._checkSignup('pw')
        this._checkSignup('pw_check')

        this._removeAlert('pw');
        this._removeAlert('pw_check');
        return true;
      }

    } else if(type === 'agree') {
      if(!agree) {
        this._alert('agree', '이용약관에 동의해주세요.');
        $('#signup_agree_input').css({ 'color' : 'black' })
        return false;

      } else {
        $('#signup_agree_input').css({ 'color' : '#1785ff' })
        return true;
      }
    }

    //this._checkSignup(type)
    return true;
  }

  _checkSignup = (type) => {
    const { alert_obj } = this.props;

    const icon = img.icon.check;
    const element = "<img class='check_icon absolute' id='check_icon_" + type +"' src=" + icon + " />";

    if(!alert_obj[type] || (type === 'pw' || type === 'pw_check')) {
      $('#signup_' + type + '_li').css({ 'color' : '#0278ae' })
      $('#signup_' + type + '_li').append(element);
    }
    
  }

  _removeAlert(target) {
    const { alert_obj, signupAction } = this.props;
    const el_target = $('#alert_' + target);
    let cover_obj = alert_obj;

    el_target.remove();
    cover_obj[target] = false;

    $('#signup_' + target + '_input').removeClass('red_alert')
    $('#signup_' + target + '_li').css({ 'color' : 'black' })
    $('#check_icon_' + target).remove();
    
    return signupAction.set_alert(cover_obj)
  }

  _mouseToggle = (bool) => {
    if(bool) {
      $('#signup_submit_button').css({ 'backgroundColor' : '#3d7ea6', 'color' : 'white' })

    } else {
      $('#signup_submit_button').css({ 'backgroundColor' : 'white', 'color' : 'black' })

    }
  }

  _inputInfo = (type, bool) => {
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
      if(bool !== undefined) {
        result.agree = bool;

      } else {
        result.agree = !agree;
      }
    }

    signupAction.input_info(result);
    return this._eachCheck(type, null, result.agree);
  }

  _checkBox = () => {
    const checkbox = $('#agree_info_button').is(":checked");
    let bool = true;

    // 활성화
    if(!checkbox) { 
      $("#agree_info_button").prop("checked", true);

    } else if(checkbox) {
    // 비활성화
      $("#agree_info_button").prop("checked", false);
      bool = false;
    } 

    return this._inputInfo('agree', bool);
  }

  render() {
    const { id, nick, pw, pw_check, agree, signup_allow } = this.props;

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
                    style={ !signup_allow ? { 'background' : '#ababab' } : null }
              />
            </form>
          </ul>
        </div>

        <div id='signup_center_height_line'> </div>
        <div> </div>

        <div id='signup_agree_div'> 
          <h4> 이용약관 동의 </h4>

          <textarea readOnly className='no_resize' defaultValue={signup_info} />

          <p id='signup_argee_checkbox_div'>
            <input type='checkbox' id='agree_info_button' className='check_custom_1'
                   defaultChecked={agree}
            />

            <span className='check_toggle_1' onClick={() => this._checkBox()}> </span>
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
    alert_obj : state.signup.alert_obj,
    signup_allow : state.signup.signup_allow
  }), 

  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch)
  })
)(Signup);