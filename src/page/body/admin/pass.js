import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';

class PassAdmin extends Component {

    async componentDidMount() {
        await this._setCheckCode();
    }

    _setCheckCode = async () => {
        const { adminAction, _checkAdmin, _sendMailer } = this.props; 

        // 인증 코드 생성
        let code_length = Math.trunc(Math.random() * (11 - 6) + 6);
        let code = '';

        for(let i = 0; i < code_length; i++) {
            let code_number = Math.trunc(Math.random() * (10 - 0) + 0);
            code += String(code_number);
        }

        // 관리자 재 확인하기
        // const user_info = await _checkLogin();

        // if(user_info.admin !== 'Y') {
        //     alert('로그인 및 관리자 권한을 다시 확인해주세요.')
        //     return window.location.replace('/');
        // }
        await _checkAdmin();

        const contents = `
            ${code}
            위의 코드를 입력해주세요.
        `
        const obj = {
            'email' : 'sejun3278@naver.com',
            'contents' : contents, 
            'title' : 'Sejun\'s Mall 관리자 인증 코드입니다.' 
        }

        // 메일 전송하기
        const sand = await _sendMailer(obj);
        
        // await axios(URL + '/api/send_mail', {
        //     method : 'POST',
        //     headers: new Headers(),
        //     data : obj
        //   })

        // 메일 전송

        if(sand === true) {
            return adminAction.set_admin_code({ 'code' : code })
        }
    }


    _checkAdmin = async (event) => {
        event.preventDefault();
        const { admin_code, _checkLogin, _checkAdmin, adminAction, _getCookie, _hashString } = this.props;

        const check_code = event.target['admin_code'].value;
        const user_info = await _checkLogin();
        
        adminAction.admin_check_toggle({ 'bool' : true  })
        // if(admin_check === false) {
            if(!user_info) {
                alert('로그아웃 된 아이디 입니다.');
                return window.location.replace('/')

            } else {
                await _checkAdmin();
            }

            if(check_code.length === 0) {
                alert('인증 코드를 입력해주세요.')

                adminAction.admin_check_toggle({ 'bool' : false  })
                return $('input[name=admin_code]').focus();
            }

            if(admin_code === check_code) {
                alert('관리자 권한 인증 성공');

                const inser_obj = { 'type' : 'INSERT', 'table' : 'admin_login', 'comment' : '관리자 로그인 로그 추가' };

                inser_obj['columns'] = [];

                inser_obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
                inser_obj['columns'].push({ "key" : "code", "value" : admin_code });
                inser_obj['columns'].push({ "key" : "login_date", "value" : null });

                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : inser_obj
                });

                const cookie_name = _hashString('admin_check');
                const cookie_obj = {}
                cookie_obj[_hashString('admin_id')] = _hashString(user_info.id);
                cookie_obj[_hashString('code')] = _hashString(admin_code);

                // 쿠키 추가
                await _getCookie(cookie_name, 'add', JSON.stringify(cookie_obj), true);
                
                return window.location.replace('/admin');

            } else {
                
                adminAction.admin_check_toggle({ 'bool' : false  })
                return alert('일치하지 않는 코드입니다.');
            }
        // }
    }

    render() {

        return(
            <div id='admin_check_div' className='aCenter'>
                <div className='my_page_title border_bottom'>
                    <h3 id='admin_check_title'> 관리자 인증 </h3>
                </div>

                <div id='admin_check_code_div'>
                    <p> 이메일로 전송된 코드를 아래에 입력해주세요. </p>

                    <form id='admin_check_form' onSubmit={this._checkAdmin}>
                        <input type='input' name='admin_code' maxLength='10' className='aCenter' />
                        <input type='submit' value='관리자 로그인' id='admin_check_button' className='pointer' />
                    </form>
                </div>
            </div>
        )
    }
}

PassAdmin.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code,
        admin_check : state.admin.admin_check
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(PassAdmin);