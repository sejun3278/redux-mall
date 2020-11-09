import React, { Component } from 'react';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';

import URL from '../../../config/url';
import $ from 'jquery';

class Modify_user extends Component {

  componentDidMount() {
    if(!JSON.parse(sessionStorage.getItem('login'))) {
      alert('로그아웃 되었습니다.');

      return window.location.replace('/');
    }
  }

  _ModifyUserInfo = (event) => {
    // const arr = ['nickname', 'email_id', 'select_email_host', 'middle_phone_number', 'last_phone_number'];
    const arr = ['nickname'];
    const { host_code, host, modify_able } = this.props;
    const form_data = event.target;

    event.preventDefault();

    let obj = { 'host_detail' : '-' };
    let final_result = true;

    const val = form_data['nickname'].value;
    
    const each_result = this._eachCheck(arr[0], val, null);

              // 닉네임 중복 체크
              const nick_overlap_check = axios(URL + '/check/nickname', {
                method : 'POST',
                headers: new Headers(),
                data : { 'nick' : val }
              })

              nick_overlap_check.then(el => {
                 console.log(el)
                if(el.data === false) {
                  final_result = false;
                }
              })

              console.log(final_result)


    // arr.forEach( (el) => {
    //   const data = form_data[el].value;

    //   console.log(el, data)
    //   // let result = this._eachCheck(el, data, null);
    //   // result.then( el => el === false ? final_result = false : null );

    //   const _promise = (el) => {
        
    //   }
    // })

    // arr.forEach( (el) => {
    //   let custom_email = null;
    //   if(el === 'host_detail') {
    //     if(host_code === null || host === null) {
    //       return true;
    //     }
    //   }

    //   if(el === 'select_email_host') {
    //   this._removeAlert('custom_email_host')
    //   let email_host = '';

    //     if(form_data[el].value !== 'custom') {
    //       email_host = form_data[el].value;
    //       data['email_host'] = email_host

    //       return true;

    //     } else {
    //       custom_email = form_data['custom_email_host'].value
    //       email_host = custom_email;
    //     }
    //     data['email_host'] = email_host
    //   }
    //   this._removeAlert(el)

    //   const each_value = form_data[el].value;
    //   data[el] = each_value;

    //   const each_result = this._eachCheck(el, each_value, custom_email);

    //   // if(each_result === false) {
    //   //   final_result = false;

    //   //   this.props.myPageAction.toggle_able({ 'bool' : false });
    //   // }
    // })


    // if(modify_able) {
    //   const modify_user_info = await axios(URL + '/update/user_info', {
    //     method : 'POST',
    //     headers: new Headers(),
    //     data : data
    //   })
    // }
  }

  _eachCheck = async (type, val, custom_email) => {
    if(!val) {
      this._removeAlert(type)
      val = $('input[name=' + type + ']').val();

      // if(type === 'select_email_host') {
      //   this._removeAlert('custom_email_host')
      //   const select_result = $('select[name=select_email_host]').val();

      //   if(val === undefined && select_result === 'custom') {
      //     custom_email = $('input[name=custom_email_host]').val();
      //     val = $('input[name=custom_email_host]').val();
      //   }
      // }
    }

    const user_info = JSON.parse(this.props.user_info); 
    const id_check = /^[a-z]+[a-z0-9]{5,14}$/g; // 아이디 체크;
    const email_host_check = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    var result = true;

    if(type === 'nickname') {
      if(val.length === 0 || (val.length !== 0 && val !== user_info.nickname)) {
        if(val.length < 3 || val.length > 10) {
          this._alert(type, '최소 3글자 이상, 10글자 이하로 입력해주세요.');
          $('input[name=nickname]').focus();
          
          result = false;
        
        } else {
          // 닉네임 중복 체크
          const nick_overlap_check = await axios(URL + '/check/nickname', {
            method : 'POST',
            headers: new Headers(),
            data : { 'nick' : val }
          })
    
          if(nick_overlap_check.data === false) {
            this._alert(type, '중복된 닉네임 입니다.');
            $('input[name=nickname]').focus();

            result = false;
          }
        }
      }

    } else {

      if(val.length === 0 && !custom_email && type !== 'host_detail') {
        return result;
      }
      return;

      if(type === 'email_id') {
        if(!id_check.test(val)) {
          this._alert(type, '영문자로 시작하는 6~15 글자 사이의 영문 또는 숫자를 입력해주세요.');
          $('input[name=email_id]').focus();

          result = false;

        } else {
          this._eachCheck('select_email_host', undefined, null)
        }

      } else if(type === 'select_email_host') {
        const test_email_check = 'testemail@' + custom_email
        $('input[name=custom_email_host]').focus();

        if(custom_email !== null) {
          this._eachCheck('email_id', null, custom_email)

          if(!email_host_check.test(test_email_check)) {
            this._alert('custom_email_host', '이메일 주소 형식을 바로 입력해주세요.');
            $('input[name=custom_email_host]').focus();
        
            result = false;

          } else {

          }
        }
        
      } else if(type === 'middle_phone_number' || type === 'last_phone_number') {
          if(isNaN(Number(val))) {
            this._alert(type, '숫자만 입력 가능합니다.');
            $('input[name=' + type + ']').focus();
        
            result = false;

          } else if(val.length !== 4) {
            this._alert(type, '4자리 모두 입력해주세요.');
            $('input[name=' + type + ']').focus();
        
            result = false;
          }

      } else if(type === 'host_detail') {
          if(val.length === 0) {
            this._alert(type, '상세 주소를 입력해주세요.');
            $('input[name=' + type + ']').focus();
        
            result = false;
          }
      }
    }
    return result;
  };

  _alert = (target, ment) => {
    const target_el = 'input[name=' + target + ']';

    let target_li = $(target_el).parent()[0];
    if(target === 'email_id' || target === 'custom_email_host') {
      target_li = $(target_li).parent().parent()[0];
    }

    const target_id = 'alert_' + target;

    $('#' + target_id).remove();

    $(target_el).addClass('red_alert');
    $(target_li).append('<p class="alert red_alert modify_user_alert" id=' + target_id +'> ' + ment + ' </p>')
  
    // this.props.myPageAction.toggle_able({ 'bool' : false });

    return false;
  }

  _removeAlert(target) {
    const alert_target = $('#alert_' + target);
    const target_input = 'input[name=' + target + ']';

    alert_target.remove();
    // this.props.myPageAction.toggle_able({ 'bool' : true });

    $(target_input).removeClass('red_alert')

    return
  }

  _changeSelectEmail = (event) => {
    event.preventDefault();

    const select = event.target.value;
    if(select === 'custom') {      
      this.props.myPageAction.custom_email_toggle({ 'bool' : true })

    } else {
      $('#alert_custom_email_host').remove();

      this.props.myPageAction.custom_email_toggle({ 'bool' : false })
    }
  }

  _handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = ''; 
    
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }
    const result = {
      "host_code" : data.zonecode,
      "host" : data.address
    }
    this.props.myPageAction.get_host_data(result);

    return this._toggleHost(false);

    // console.log(fullAddress);  // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
  }

  _toggleHost = (bool) => {
    const { myPageAction } = this.props;
    const offset = $("#search_first_host").offset();

    myPageAction.toggle_host({ 'bool' : bool })

    if(bool === true) {
      $('#daum_host_api').focus();
      $('body, html').animate({ scrollTop : offset.top}, 400)
    }
  }

  _test = () => {
    const data = $('input[name=nickname]').val();

    // let result = this._eachCheck('nickname', data, null);
    // console.log(result)
  }

    render() {
      const { email_custom, host_open, host_code, host, modify_able } = this.props;
      const user_info = JSON.parse(this.props.user_info);

        return(
            <div id='modify_user_div'>
              <div id='modify_user_title_div' className='my_page_title border_bottom'>
                <h3 className='aCenter'> 회원정보 수정 </h3>
              </div>

              <div id='modify_user_info_div'>
                {!user_info
                  ?
                  <div id='modify_user_info_waiting' className='aCenter gray'> 
                      <p> 유저 정보를 가져오는 중입니다. </p>
                      <p> 잠시만 기다려주십시오. </p>
                  </div>
                  :
                  <div id='modify_user_div_grid' className='border_bottom'>
                    <div />
                    <div>
                      <form id='modify_user_info_form' onSubmit={this._ModifyUserInfo}>
                      <ul id='modify_user_info_ul' className='list_none'>
                        <li>
                          <h4> 아이디 </h4>
                          <input type='text' readOnly disabled defaultValue={user_info.user_id} /> 
                        </li>

                        <li>
                          <h4> 닉네임 <b> * </b> </h4>
                          <input type='text' defaultValue={user_info.nickname} maxLength='10'
                                name='nickname' onChange={() => this._eachCheck('nickname', null, null)}
                          />
                        </li>

                        <li>
                          <h4> 이메일 </h4>
                            <div id='modify_user_email_grid'>
                              <div>
                                <input type='text' 
                                  maxLength='15'
                                  id='modify_user_email_id'
                                  name='email_id'
                                  onChange={() => this._eachCheck('email_id', null, null)}
                                />
                              </div>
                              <div className='aCenter' style={{ 'marginTop' : '14px' }}>　@　</div>
                              <div id='modify_user_select_email_host_div'>
                                <select id='modify_user_select_email' name='select_email_host'
                                      onChange={this._changeSelectEmail}
                                >
                                  <option value='naver.com'> naver.com </option>
                                  <option value='gamil.com'> gmail.com </option>
                                  <option value='daum.net'> daum.net </option>
                                  <option value='custom'> 직접 입력 </option>
                                </select>

                              {email_custom 
                              ?
                                <div id='modify_user_email_input'>
                                  <input type='text' maxLength='10' name='custom_email_host' 
                                        onChange={() => this._eachCheck('select_email_host', null, null)}
                                  />
                                </div>
                              : null }
                              </div>
                            </div>
                        </li>

                        <li id='modify_user_phone_div'>
                          <h4> 전화번호 </h4>
                          <select id='modify_user_first_phone' name='first_phone_number'> 
                            <option value='010'> 010 </option>
                            <option value='011'> 011 </option>
                            <option value='013'> 013 </option>
                          </select>
                          　-　
                          <input 
                            id='modify_user_middle_phone'
                            className='modify_user_phone_input'
                            name='middle_phone_number'
                            maxLength='4'
                            onChange={() => this._eachCheck('middle_phone_number', null, null)}
                          />
                          　-　
                          <input 
                            id='modify_user_last_phone'
                            className='modify_user_phone_input'
                            name='last_phone_number'
                            maxLength='4'
                            onChange={() => this._eachCheck('last_phone_number', null, null)}
                          />
                        </li>

                        <li id='modify_user_host_div'>
                          <h4> 주소 </h4>
                          <input type='text' defaultValue={host_code} readOnly placeholder='우편 번호' />
                          <input type='button' value='우편번호 검색' id='search_first_host'
                                onClick={() => this._toggleHost(true)} className='pointer'
                          />
                        </li>

                        {host_open ?   
                          <div id='daum_host_api'>
                            <div id='daum_host_api_close' className='pointer white'
                              onClick={() => this._toggleHost(false)}
                            > 
                              ▲ 닫기 
                            </div>                   
                            <DaumPostcode
                              onComplete={this._handleComplete}
                            />
                          </div>

                        : null}

                        {host_code && host ?
                        <div id='modify_user_detail_host_div'>
                          <li>
                            <h4> 도로명 주소 </h4>
                            <input readOnly defaultValue={host}/>
                          </li>

                          <li>
                            <h4> 상세 주소 </h4>
                            <input maxLength='25' name='host_detail'/>
                          </li>
                        </div>
                        : null}
                      </ul>
                      
                      <div id='modify_user_submit_div'>
                        <input 
                              id='modify_user_submit_button'
                              className='modify_user_buttons pointer'
                              type='submit'
                              value='회원정보 저장'
                        />
                      </div>
                      </form>

                      <div>
                          <input value='테스트' type='button' onClick={this._test} />
                      </div>
                    </div>
                    <div />

                    {/* <div id='modify_user_other_div'>
                      <div>
                        <input 
                              id='modify_password_button'
                              className='modify_user_buttons'
                              type='submit'
                              value='비밀번호 변경'
                        />
                      </div>
                      
                      <div>
                        <input 
                              id='remove_user_button'
                              className='modify_user_buttons'
                              type='submit'
                              value='회원탈퇴'
                        />
                      </div>
                    </div> */}

                  </div>
                }
              </div>
            </div>
        )
    }
}

Modify_user.defaultProps = {

}
  
  export default connect(
    (state) => ({
      user_info : state.config.user_info,
      email_custom : state.my_page.email_custom,
      host_open : state.my_page.host_open,
      host_code : state.my_page.host_code,
      host : state.my_page.host,
      modify_able : state.my_page.modify_able
    }),   
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Modify_user);