import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';

class PassAdmin extends Component {

    componentDidMount() {
        this._setCheckCode();
    }

    _setCheckCode = async () => {
        const { adminAction, user_info, _checkAdmin } = this.props; 
        // 인증 코드 생성
        let code_length = Math.trunc(Math.random() * (11 - 6) + 6);
        let code = '';

        for(let i = 0; i < code_length; i++) {
            let code_number = Math.trunc(Math.random() * (10 - 0) + 0);
            code += String(code_number);
        }

        // 관리자 재 확인하기
        const recheck_admin = await _checkAdmin(user_info);

        if(recheck_admin.data === false) {
            alert('로그인 및 관리자 권한을 다시 확인해주세요.')

            return window.location.replace('/');
        }

        const contents = `
            <h4> ${code} </h4>
            <div> 위의 코드를 입력해주세요. </div>
        `
        const obj = {
            'email' : 'sejun3278@naver.com',
            'contents' : contents, 
            'title' : 'Sejun\'s Mall 관리자 인증 코드입니다.' 
        }

        await axios(URL + '/api/send_mail', {
            method : 'POST',
            headers: new Headers(),
            data : obj
          })

        // 메일 전송

        return adminAction.set_admin_code({ 'code' : code })
    }


    _checkAdmin = async (event) => {
        event.preventDefault();
        const { admin_code, login, _checkLogin, _checkAdmin } = this.props;

        const check_code = event.target['admin_code'].value;
        _checkLogin();

        const user_info = JSON.parse(sessionStorage.getItem('login'));

        if(!login || !user_info) {
            alert('로그아웃 된 아이디 입니다.');

            return window.location.replace('/');

        } else {
            // 관리자 재 확인하기
            const recheck_admin = await _checkAdmin(user_info);

            if(recheck_admin.data === false) {
                alert('로그인 및 관리자 권한을 다시 확인해주세요.')
    
                return window.location.replace('/');
            }
        }

        if(check_code.length === 0) {
            alert('인증 코드를 입력해주세요.')

            return $('input[name=admin_code]').focus();
        }

        if(admin_code === check_code) {
            sessionStorage.setItem('admin', user_info.user_id)

            alert('관리자 권한 인증 성공');

            return window.location.replace('/admin');

        } else {
            return alert('일치하지 않는 코드입니다.');
        }
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
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(PassAdmin);