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

let signup = false;
class Signup extends Component {

  componentDidMount() {
    const { login, user_info } = this.props;
    
    if(user_info || login === true) {
      alert('로그인 중입니다.');
      return window.location.replace('/')
    }
  }

  _signupCheck = async (event) => {
    const arr = ['id', 'nick', 'name', 'email', 'pw', 'pw_check'];
    const form_data = event.target;

    const { signupAction, _getCookie, _addCoupon } = this.props;
    const { id, nick, name, pw, email_id, email_host, agree } = this.props;

    let signup_allow = true;
    if(signup === true) {
      alert('회원가입 처리중입니다. \n잠시만 기다려주세요.');

      event.preventDefault();
      return;

    } else if(agree === false) {
      this._alert('agree', '이용약관에 동의해주세요.');
      $('#signup_agree_input').css({ 'color' : 'black' })

      signup_allow = false;
    }

    signup = true;

    $('body').css({ 'cursor' : 'wait' });

    const all_check_fn = async (limit) => {
      const value = form_data[arr[limit]].value.trim();
      const cover_signup_allow = await this._eachCheck(String(arr[limit]), value, true);

      if(cover_signup_allow === false) {
        signup_allow = false;
      }

      limit += 1;
      if(limit === arr.length) {
        return signup_allow;
      }

      return all_check_fn(limit);
    }

    event.preventDefault();
    const all_check = signup_allow === true ? await all_check_fn(0) : false;

    $('body').css({ 'cursor' : 'default' });

    if(all_check === false) {
      signup = false;
      return;

    } else {
      const all_email = email_id + '@' + email_host;

      signupAction.signup_allow({ 'bool' : true });
      const qry_arr = [];
      qry_arr[0] = { 'user_id' : id };
      qry_arr[1] = { 'nickname' : nick };
      qry_arr[2] = { 'email' : all_email };

      const data = { id : id, nick : nick, name : name, email : all_email, pw : pw, 'qry' : qry_arr };

      const add_user = await axios(URL + '/add/signup', {
        method : 'POST',
        headers: new Headers(),
        data : data
      })

      if(add_user.data !== true) {
        signupAction.signup_allow({ 'bool' : false });

      } else {
        // 회원가입 쿠폰 제공
        await _addCoupon('welcome', null, false, false, id, true);

        const { _stringCrypt } = this.props;

        // 1차 회원가입 완료
        await _getCookie('signup', 'add', _stringCrypt(id, '_signup_complate_id', true), true);

        signup = false;

        // const test = await _getCookie('signup', 'get', null, true);
        // const test2 = _stringCrypt(test, 'id', false);

        return window.location.replace('/signup/complate/' + id)
      }
    }  
  }

  _alert = (target, ment) => {
    const { alert_obj, email_select, signupAction } = this.props;
    let cover_obj = alert_obj;

    const target_el = '#signup_' + target + '_input';

    let target_li;
    if(target === 'email') {
      target_li = $('#signup_email_li').children()[0];

    } else if(target === 'email_custom') {
      if(email_select === 'custom') {
        $('#signup_email_custom_input').addClass('red_alert');
        $('#signup_email_custom_input_div').append('<p class="alert red_alert" id=alert_' + target +'> ' + ment + ' </p>')

        return false;
      }

    } else {
      target_li = $(target_el).parent()[0]; 
    }

    const target_id = 'alert_' + target;

    if(cover_obj[target] === false || cover_obj[target] === undefined) {
      $(target_el).addClass('red_alert');
      $(target_li).append('<p class="alert red_alert" id=' + target_id +'> ' + ment + ' </p>')
    }
    cover_obj[target] = true;

    signupAction.set_alert(cover_obj)
    return false;
  }

  _eachCheck = async (type, data, mode) => {
    const { email_select } = this.props;
    this._removeAlert(type);

    if(type === 'email') {
      $('#alert_email_custom').remove();
      $('#signup_email_custom_input').removeClass('red_alert')
    }

    if(!data) {
      data = $('input[name=' + type + ']').val().trim();
    }

    let result = true;
    if(type !== 'agree') {
      if(data.length === 0 && !mode) {
        if(email_select !== 'custom') {
          return this._removeAlert(type);
        }
      }
    }

    const id_check = /^[a-z]+[a-z0-9]{5,14}$/g; // 아이디 체크
    let data_arr = []; // 쿼리 arr;

    const overlap_check = { 'type' : 'SELECT', 'table' : 'userInfo' }

    overlap_check['option'] = {};
    overlap_check['where'] = [];

    let overlap_ment = '';
    if(type === 'id') {
      if(!id_check.test(data)) {
        this._alert(type, '영문자로 시작하는 6~15 글자 사이의 영문 또는 숫자를 입력해주세요.')
        return false;
      }

      overlap_check['comment'] = '아이디 중복 체크'

      overlap_check['option']['user_id'] = '=';
      overlap_check['where'][0] = { 'table' : 'userInfo', 'key' : 'user_id', value : data };

      overlap_ment = '중복되는 아이디입니다.';

    } else if(type === 'nick') {
      if(data.length < 3 || data.length > 15) {
        this._alert(type, '최소 3글자 이상, 15글자 이하로 입력해주세요.')
        return false;
      }

      overlap_check['comment'] = '닉네임 중복 체크'

      overlap_check['option']['nickname'] = '=';
      overlap_check['where'][0] = { 'table' : 'userInfo', 'key' : 'nickname', value : data };

      overlap_ment = '중복되는 닉네임입니다.';

    } else if(type === 'name') {
      const check_name = /([^가-힣a-z\x20])/i; 
      
        if(data.length < 2) {
          this._alert(type, '최소 2글자 이상, 15글자 이하로 입력해주세요.')
          return false;

        } else if(check_name.test(data)) {
          this._alert(type, '숫자, 특수문자, 한글의 자음 및 모음 사용 불가')
          return false;
        }

    } else if(type === 'email') {
      overlap_ment = '중복되는 이메일입니다.';

      if(!id_check.test(data)) {
        this._alert(type, '영문자로 시작하는 6~15 글자 사이의 영문 또는 숫자를 입력해주세요.')
        result = false;
      }

      let email_host;
      if(email_select === 'custom') {
        email_host = $('input[name=email_custom_input]').val().trim();

        if(!email_host.includes('.') || (email_host[email_host.length - 1] === '.' || email_host[0] === '.')) {
          type = 'email_custom';

          this._alert(type, '이메일 형식과 동일하게 입력해주세요.')
          return false;
        }

      } else {
        email_host = $('select[name=email_select]')[0].value;
      }

      if(result === true) {
        // 이메일 중복 체크
        const email = data + '@' + email_host;
        data_arr.push({ "email" : email });

        if(email_host === 'custom') {
          type = 'email_custom';

          this._alert(type, '이메일 형식과 동일하게 입력해주세요.');
          return false;
        }

        overlap_check['comment'] = '이메일 중복 체크'

        overlap_check['option']['email'] = '=';
        overlap_check['where'][0] = { 'table' : 'userInfo', 'key' : 'email', value : email };
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
    }

    if(overlap_check.comment !== undefined) {
      const overlap_check_result = await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : overlap_check
      })

      if(overlap_check_result.data[0][0] !== undefined) {
        this._alert(type, overlap_ment);
        return false;
      }
    }

    //this._checkSignup(type)
    return result;
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

  _inputInfo = (type) => {
    const { signupAction, id, nick, name, email_id, email_host, pw, pw_check } = this.props;
    const data = $('#signup_' + type + '_input').val().trim();
    const agree = $('#agree_info_button').is(":checked");

    let result = {
      id : id,
      nick : nick,
      name : name,
      email_id : email_id,
      email_host : email_host,
      pw : pw,
      pw_check : pw_check,
      agree : agree
    };

    if(type === 'id') {
      result.id = data;

    } else if(type === 'nick') {
      result.nick = data;

    } else if(type === 'name') {
      result.name = data;
    
    } else if(type === 'email') {
      result.email_id = $('input[name=email]').val().trim();

      let email_select = $('select[name=email_select]').val();
      if(email_select === 'custom') {

        let email_custom_host = '';
        if($('input[name=email_custom_input]').val()) {
          email_custom_host = $('input[name=email_custom_input]').val().trim();
        }

        signupAction.toggle_select_email_host({ 'bool' : 'custom' });
        result.email_host = email_custom_host;

      } else {
        signupAction.toggle_select_email_host({ 'bool' : null });
        result.email_host = email_select;
      }

    } else if(type === 'pw') {
      result.pw = data;

    } else if(type === 'pw_check') {
      result.pw_check = data;

    } else if(type === 'agree') {
    }

    signupAction.input_info(result);
    return this._eachCheck(type, null, result.agree);
  }

  _checkBox = (agree, bool) => {
    const { signupAction } = this.props;

    const target = document.getElementById('agree_info_button');
    if(bool === true) {
      target.checked = agree;
    }

    const agree_alert = document.getElementById('alert_agree');
    if(agree_alert !== null) {
      document.getElementById('alert_agree').style.display = 'none'
    }

    signupAction.input_info({ 'agree' : agree });
  }

  render() {
    const { email_host, email_select, agree, signup_allow } = this.props;
    const { _signupCheck, _checkBox } = this;

    return(
      <div id='signup_div'>
        <h3 className='aCenter marginTop_30 recipe_korea' id='signup_title_div'> 회원가입 </h3>

        <form id='signup_form' onSubmit={_signupCheck}>
        <div id='signup_div_grid'>
          <div id='signup_info_div' className='bold'> 
            <ul className='list_none'>
              <li className='signup_li' id='signup_id_li'>
                <p> 아이디 </p>
                <input id='signup_id_input' name='id' type='text' placeholder='15 글자 이내의 영문 입력' maxLength='15'
                  onBlur={() => this._inputInfo('id')}
                />
              </li>

              <li className='signup_li' id='signup_nick_li'> 
                <p> 닉네임 </p>
                <input id='signup_nick_input' name='nick' type='text' placeholder='15 글자 이내의 영문 및 한글 입력' maxLength='15'
                  onBlur={() => this._inputInfo('nick')}
                />
              </li>

              <li className='signup_li' id='signup_name_li'> 
                <p> 이름 </p>
                <input id='signup_name_input' name='name' type='text' placeholder='15 글자 이내의 영문 및 한글 입력' maxLength='15'
                  onBlur={() => this._inputInfo('name')}
                />
              </li>

              <li className='signup_li' id='signup_email_li'> 
                <p> 이메일 </p>
                <div className='grid_half' name='email_id_alert'>
                  <div>
                    <input className='signup_email_inputs' id='signup_email_input' name='email' type='text' placeholder='15 글자 이내의 영문 입력' maxLength='15'
                      onBlur={() => this._inputInfo('email')}
                    />
                  </div>

                  <div>
                    　@　
                    <select name='email_select' id='signup_email_host_select' onBlur={() => this._inputInfo('email')}>
                      <option value='naver.com'> naver.com </option>
                      <option value='gmail.com'> gamil.com </option>
                      <option value='daum.net'> daum.net </option>
                      <option value='custom'> 직접 입력 </option>
                    </select>
                  </div>
                </div>

              {email_select === 'custom'
                ? <p id='signup_email_custom_input_div' className='marginTop_10'>
                      ▶　<input type='text' deaultvalue={email_host} name='email_custom_input' maxLength='20' placeholder='이메일 형식을 입력해주세요.'
                                id='signup_email_custom_input' onBlur={() => this._inputInfo('email')}
                      />
                    </p>
                : null}
              </li>

              <li className='signup_li' id='signup_pw_li'> 
                <p> 비밀번호 </p>
                <input id='signup_pw_input' name='pw' autoComplete="true" type='password' maxLength='20'
                  onBlur={() => this._inputInfo('pw')}
                />
              </li>

              <li className='signup_li' id='signup_pw_check_li'> 
                <p> 비밀번호 확인 </p>
                <input id='signup_pw_check_input' name='pw_check' autoComplete="true" type='password' maxLength='20'
                  onBlur={() => this._inputInfo('pw_check')}
                />
              </li>
            </ul>
          </div>

          <div id='signup_agree_div'> 
            <h4 className='recipe_korea'> 이용약관 동의 </h4>

            <textarea readOnly className='no_resize' defaultValue={signup_info} />

            <p id='signup_argee_checkbox_div'>
              <input type='checkbox' id='agree_info_button' name='agree' className='check_custom_1' />

              <span className='check_toggle_1' onClick={() => _checkBox(!agree, true)}> </span>
              <label htmlFor='agree_info_button' id='signup_agree_input'
                    onClick={() => _checkBox(!agree)}
                    className={agree === false ? 'pointer font_13 recipe_korea' : 'pointer font_13 custom_color_1 bold recipe_korea'}
              > 
                이용약관에 동의합니다.  
              </label>
            </p>
          </div>
        </div>

        <div id='signup_submit_div'>
          <input type='submit' id='signup_submit_button' className='pointer recipe_korea' value='가입 신청' 
                onMouseOver={() => this._mouseToggle(true)}      
                onMouseLeave={() => this._mouseToggle(false)}
                style={ !signup_allow ? { 'background' : '#ababab' } : null }
          />
        </div>

        </form>
      </div>
    )
  }
}

Signup.defaultProps = {
  id : "",
  nick : "",
  name : "",
  pw : "",
  pw_check : "",
}

export default connect(
  (state) => ({
    id : state.signup.id,
    nick : state.signup.nick,
    name : state.signup.name,
    email_id : state.signup.email_id,
    email_host : state.signup.email_host,
    email_select : state.signup.email_select,
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