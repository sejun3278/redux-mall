import React, { Component } from 'react';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import URL from '../../../config/url';
import $ from 'jquery';

import SearchIDPW from '../search_id_pw';
import Disable from './disable';

const customStyles = {
  content : {
    top                   : '300px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '400px',
  }
};

class Modify_user extends Component {

  componentDidMount() {
    if(!JSON.parse(sessionStorage.getItem('login'))) {
      alert('로그아웃 되었습니다.');

      return window.location.replace('/');
    }
  }

  _updateUserInfo = async (event) => {
    const { user_info } = this.props;
    const cover_user_info = JSON.parse(user_info); 

    const arr = ['nickname', 'name', 'email_id', 'select_email_host', 'middle_phone_number', 'last_phone_number', 'host_code'];
    const form_data = event.target;

    let final_result = true;
    let data = { 'id' : cover_user_info.id, 'user_id' : cover_user_info.user_id };

    arr.forEach( async (target, key) => {
      const target_data = form_data[target].value;
      const each_check_result = await this._eachCheck(target, target_data);

      if(target === 'select_email_host') {
        const email_id = form_data['email_id'].value;
        let email_str = email_id + '@';

          if(target_data === 'custom') {
            const email_host = form_data['custom_email_host'].value;
            email_str += email_host;

          } else {
            email_str += target_data;
          }

          if(email_id.length === 0) {
            email_str = "";
          }

        data['email'] = email_str;

      } else if(target === 'last_phone_number') {
        const first_phone_num = $('select[name=first_phone_number]').val();
        const middle_phone_number = $('input[name=middle_phone_number]').val();

        data['phone'] = first_phone_num + '-' + middle_phone_number + '-' + target_data;

        if(middle_phone_number.length === 0 || target_data.length === 0) {
          data['phone'] = "";
        }

      } else if(target === 'host_code') {
        data['host_code'] = target_data;

        const host = $('input[name=host]').val();
        data['host'] = host;

        const host_detail = $('input[name=host_detail]').val();
        data['host_detail'] = host_detail;

        if(target_data === "") {
          data['host'] = "";
          data['host_detail'] = "";
        }
      }

      if(each_check_result.result === false) {
        final_result = false;
      }

      if(arr.length === (key + 1)) {
        // map 끝
        
        if(cover_user_info.email !== data['email']) {
          
          const overlap_email = await this._checkEmail();
          if(overlap_email === false) {
            // 이메일 중복
            return;
          }
        }

        if(final_result) {
          data['nickname'] = form_data['nickname'].value;
          data['name'] = form_data['name'].value;
          data['modify_date'] = null;
          data['max'] = 8;

          const update_user_info = await axios(URL + '/update/user_info', {
            method : 'POST',
            headers: new Headers(),
            data : data
          })

          if(update_user_info.data) {
            alert('변경 사항을 저장했습니다.');

            return window.location.replace('/myPage');
          }
        }
      }
    })

    event.preventDefault();
    return;
  }

  _eachCheck = async (target, data) => {
    const { user_info } = this.props;
    const cover_user_info = JSON.parse(user_info);
    
    let obj = {};
    obj['result'] = true;

    let alert_ment = '';
    const alert_return = (target, alert_ment) => {
      this._alert(target, alert_ment);
      $('input[name=' + target + ']').focus();
    
      obj['result'] = false;

      return obj;
    }

    // const user_info = JSON.parse(sessionStorage.getItem('login'));

    const id_check = /^[a-z]+[a-z0-9]{5,14}$/g; // 아이디 체크
    if(data === null) {
      if(target === 'select_email_host') {
        data = $('select[name=select_email_host]').val();

      } else {
        data = $('input[name=' + target + ']').val().trim();
      }
    }

    this._removeAlert(target);

      // 닉네임은 필수로 체크해야 됨

      cover_user_info[target] !== data 
        ? obj['modify'] = true
        : obj['modify'] = false

      if(target === 'nickname') {
        if(data.length === 0 || (data.length < 3)) {
          // 빈칸일 경우          
          alert_ment = '최소 3글자 이상, 10 글자 이하로 입력해주세요.';

          return alert_return(target, alert_ment);

        } else if(cover_user_info.nickname !== data) {
          // 닉네임 중복 체크
          await axios(URL + '/check/nickname', {
            method : 'POST',
            headers: new Headers(),
            data : { 'nick' : data }

          }).then( (el) => {
            if(el.data === false) {
              alert_ment = '이미 사용중인 닉네임입니다.';

              return alert_return(target, alert_ment);
            }
          })
        };

      } else if(target === 'name') {
      const check_name = /([^가-힣a-z\x20])/i; 
      
        if(data.length < 2) {
          alert_ment = '최소 2글자 이상, 15글자 이하로 입력해주세요.';
          return alert_return(target, alert_ment)

        } else if(check_name.test(data)) {
          alert_ment = '숫자, 특수문자, 한글의 자음 및 모음 사용 불가';

          return alert_return(target, alert_ment)
        }

      } else if(target === 'email_id') {
        // 이메일 아이디 체크
        if(!id_check.test(data)) {
          target = 'email_id';
          alert_ment = '영문자로 시작하는 6글자 이상의 아이디를 입력하세요.';
          
          return alert_return(target, alert_ment);
        }
        
        obj['result'] = this._checkEmail();
      
      } else if(target === 'select_email_host') {

        // 이메일 주소 선택
        if(data === 'custom') {
          // 이메일 직접 입력 선택시
          const email_host = $('input[name=custom_email_host]').val().trim();
          if(email_host.length === 0 || !email_host.includes('.') || email_host[0] === '.' || email_host[email_host.length - 1] === '.') {
            target = 'custom_email_host';
            alert_ment = '이메일 형식과 동일하게 입력해주세요.';

            return alert_return(target, alert_ment);
          }
        }

        obj['result'] = this._checkEmail();

      } else if(target === 'middle_phone_number' || target === 'last_phone_number') {
        const middle_phone_number = $('input[name=middle_phone_number]').val().trim();
        const last_phone_number = $('input[name=last_phone_number]').val().trim();

        if(data.length > 0 && isNaN(Number(data))) {
          alert_ment = '숫자만 입력 할 수 있습니다.';

          return alert_return(target, alert_ment);
        }

        if(target === 'last_phone_number') {
          if(middle_phone_number.length !== 0) {
            if(last_phone_number.length === 0) {
              target = 'last_phone_number'
              alert_ment = '마지막 번호를 입력해주세요.';
              
              return alert_return(target, alert_ment);
            }
          }

          if(last_phone_number.length > 0) {
            if(middle_phone_number.length === 0) {
              target = 'middle_phone_number'
              alert_ment = '가운데 번호를 입력해주세요.';
              
              return alert_return(target, alert_ment);
            }
          }
        }

      } else if(target === 'host_code') {
        if(data.length !== 0) {
          target = 'host_detail';
          const host_detail = $('input[name=' + target + ']').val().trim();

          if(host_detail.length === 0) {
            alert_ment = '상세 주소를 입력해주세요.';

            return alert_return(target, alert_ment);
          }
        }
      }

    return obj;
  }; // eachCheck 함수 끝

  // 이메일 중복 체크하기
  _checkEmail = async () => {
    const user_info = JSON.parse(this.props.user_info);

    const email_id = $('input[name=email_id]').val().trim();
    let email_host = $('select[name=select_email_host]').val();

    if(email_host === 'custom') {
      email_host = $('input[name=custom_email_host]').val();
    }

    const email_str = email_id + '@' + email_host;

    if(user_info.email !== email_str) {
      const qry_arr = [];
      qry_arr[0] = { "email" : email_str };

      // 이메일 중복 체크
      const email_over_lap = await axios(URL + '/check/user_data', {
        method : 'POST',
        headers: new Headers(),
        data : qry_arr
      })

      if(email_over_lap.data === true) {
        const target = 'email_id';
        const alert_ment = '이미 사용중인 이메일입니다.';
              
        this._alert(target, alert_ment);

        return false;
      }
    }
    
    return true;
  }

  _alert = (target, ment) => {
    const target_el = 'input[name=' + target + ']';

    let target_li = $(target_el).parent()[0];
    // if(target === 'email_id' || target === 'custom_email_host') {
    //   target_li = $(target_li).parent().parent()[0];
    // }

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

    if(target === 'select_email_host') {
      $('input[name=custom_email_host]').removeClass('red_alert');
      $('#alert_custom_email_host').remove();
    }

    // this.props.myPageAction.toggle_able({ 'bool' : true });

    $(target_input).removeClass('red_alert')

    return
  }

  _changeSelectEmail = (event) => {
    event.preventDefault();

    const select = event.target.value;

    if(select === 'custom') {      
      $('input[name=custom_email_host]').show();
      this.props.myPageAction.custom_email_toggle({ 'bool' : true })

    } else {
      $('#alert_custom_email_host').remove();
      $('#alert_email_id').remove();

      $('#modify_user_email_id').removeClass('red_alert')
      $('input[name=custom_email_host]').hide();

      this.props.myPageAction.custom_email_toggle({ 'bool' : false })
    }

    return this._checkEmail();
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

  _toggleOther = (bool, type, num) => {
    const { myPageAction, configAction } = this.props;

    const obj = { 'bool' : bool, 'type' : type, 'type_num' : 3 };

    if(type === 'disable') {
      if(num) {
        obj['type_num'] = num;
      }
    }

    configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : false, 'result_id' : "", mypage_url : true })
    configAction.toggle_search_id_and_pw({ 'bool' : true, 'type' : 'pw' });
    myPageAction.toggle_modify_other_modal(obj);
  }

    render() {
      const { email_custom, host_open, host_code, host, user_info, modify_other_modal, modify_other_type } = this.props;
      const { _toggleOther } = this;
      const cover_user_info = JSON.parse(user_info);

      let email_arr = ['', ''];
      let phone_arr = ['', '', ''];
      if(cover_user_info !== null) {
        if(cover_user_info.email) {
          email_arr = cover_user_info.email.split('@');
        }

        if(cover_user_info.phone) {
          phone_arr = cover_user_info.phone.split('-');
        }
      }

      let email_host_check = ['naver.com', 'gmail.com', 'daum.net'];
      email_host_check = email_host_check.includes(email_arr[1]);

        return(
            <div id='modify_user_div'>
              <div id='modify_user_title_div' className='my_page_title border_bottom'>
                <h3 className='aCenter'> 회원정보 수정 </h3>
              </div>

              <div id='modify_user_info_div'>
                {!cover_user_info
                  ?
                  <div id='modify_user_info_waiting' className='aCenter gray'> 
                      <p> 유저 정보를 가져오는 중입니다. </p>
                      <p> 잠시만 기다려주십시오. </p>
                  </div>
                  :
                  <div id='modify_user_div_grid' className='border_bottom'>
                    <div />
                    <div>
                      <div className='gray font_14 aCenter' id='modify_user_date_div'> 
                        최근 수정일　:　{cover_user_info.modify_date ? cover_user_info.modify_date : '정보 없음'}
                      </div>

                      <form id='modify_user_info_form' onSubmit={this._updateUserInfo}>
                      <ul id='modify_user_info_ul' className='list_none aCenter'>
                        <li className='modify_user_responsive_div'>
                          <h4> 아이디 </h4>
                          <input type='text' readOnly disabled defaultValue={cover_user_info.user_id} /> 
                        </li>

                        <li className='modify_user_responsive_div'>
                          <h4> 닉네임 <b> * </b> </h4>
                          <input type='text' defaultValue={cover_user_info.nickname} maxLength='10'
                                name='nickname' onChange={() => this._eachCheck('nickname', null, null)}
                          />
                        </li>

                        <li className='modify_user_responsive_div'>
                          <h4> 이름 </h4>
                          <input type='text' defaultValue={cover_user_info.name} maxLength='15'
                                name='name' onChange={() => this._eachCheck('name', null, null)}
                          />
                        </li>

                        <li id='modify_user_email_li'  className='aCenter'>
                          <h4> 이메일 </h4>
                            <div id='modify_user_email_grid'>
                                <input type='text' 
                                  maxLength='15'
                                  id='modify_user_email_id'
                                  name='email_id'
                                  defaultValue={email_arr[0]}
                                  onChange={() => this._eachCheck('email_id', null, null)}
                                />
                                　@　
                                <select id='modify_user_select_email' name='select_email_host'
                                      onChange={this._changeSelectEmail} defaultValue={email_host_check ? email_arr[1] : 'custom'}
                                >
                                  <option value='naver.com'> naver.com </option>
                                  <option value='gamil.com'> gmail.com </option>
                                  <option value='daum.net'> daum.net </option>
                                  <option value='custom'> 직접 입력 </option>
                                </select>

                              {email_custom || email_host_check === false
                              ?
                                <div id='modify_user_email_input'>
                                  ▶　<input type='text' maxLength='15' name='custom_email_host' defaultValue={email_arr[1]}
                                        onChange={() => this._eachCheck('select_email_host', null, null)}
                                  />
                                </div>
                              : null }
                              </div>
                        </li>

                        <li id='modify_user_phone_div'>
                          <h4> 전화번호 </h4>
                          <select id='modify_user_first_phone' name='first_phone_number' defaultValue={phone_arr[0]}> 
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
                            defaultValue={phone_arr[1]}
                            onChange={() => this._eachCheck('middle_phone_number', null, null)}
                          />
                          　-　
                          <input 
                            id='modify_user_last_phone'
                            className='modify_user_phone_input'
                            name='last_phone_number'
                            maxLength='4'
                            defaultValue={phone_arr[2]}
                            onChange={() => this._eachCheck('last_phone_number', null, null)}
                          />
                        </li>

                        <li id='modify_user_host_div' className='modify_user_responsive_div'>
                          <h4> 주소 </h4>
                          <input type='text' defaultValue={host_code ? host_code : cover_user_info.host_code} readOnly placeholder='우편 번호' name='host_code' />
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

                        {(host_code && host) || cover_user_info.host_code ?
                        <div id='modify_user_detail_host_div'>
                          <li className='modify_user_responsive_div'>
                            <h4> 도로명 주소 </h4>
                            <input name='host' readOnly defaultValue={host ? host : cover_user_info.host}/>
                          </li>

                          <li className='modify_user_responsive_div'>
                            <h4> 상세 주소 </h4>
                            <input maxLength='25' name='host_detail' defaultValue={cover_user_info.host_detail}/>
                          </li>
                        </div>
                        : null}
                      </ul>
                      
                        <input 
                              id='modify_user_submit_button'
                              className='pointer'
                              type='submit'
                              value='회원정보 저장'
                        />
                      </form>

                      <div id='modify_user_other_div'>
                        <Modal
                            isOpen={modify_other_modal}
                            // onAfterOpen={afterOpenModal}
                            // onRequestClose={() => _toggleOther(false)}
                            style={customStyles}
                            // contentLabel="Example Modal"
                          >
                            {modify_other_type === 'search_pw' 
                              ? <SearchIDPW />
                              : <Disable _toggleOther={_toggleOther} />
                            }
                        </Modal>

                        <div>
                          <input type='button' className='pointer' onClick={() => _toggleOther(true, 'search_pw')} value='비밀번호 변경' />
                        </div>

                        <div>
                          <input type='button' className='pointer' onClick={() => _toggleOther(true, 'disable')} value='회원 탈퇴' />
                        </div>
                      </div>
                    </div>
                    <div />
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
      modify_able : state.my_page.modify_able,
      modify_other_modal : state.my_page.modify_other_modal,
      modify_other_type : state.my_page.modify_other_type
    }),   
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Modify_user);