import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';
import * as configAction from '../../Store/modules/config';

import '../../css/responsive/signup.css';
import img from '../../source/img/icon.json';
import URL from '../../config/url';

class Login extends Component {

    _moveSignup = () => {
        const { signupAction, _pageMove } = this.props; 

        signupAction.modal_toggle({ 'bool' : false })
        return _pageMove('replace', '/signup')
    }

    _logins = async (event) => {
        const { signupAction, configAction, login_able, login_after } = this.props; 

        event.preventDefault();
        const form_data = event.target;

        if(login_able) {
        const user_id = form_data.id.value.trim();
        const pw = form_data.pw.value.trim();

        if(user_id.length === 0) {
            return alert('아이디를 입력해주세요.')

        } else if(pw.length === 0) {
            return alert('비밀번호를 입력해주세요.')
        }   
        
        signupAction.login_toggle({ 'bool' : false })
        const data = { user_id : user_id, pw : pw };
        const login_api = await axios(URL + '/api/login', {
          method : 'POST',
          headers: new Headers(),
          data : data
        })

        if(!login_api.data.bool) {
            signupAction.login_toggle({ 'bool' : true })
            return alert('아이디 및 비밀번호를 다시 확인해주세요.');
        
        } else {
            // sessionStorage.setItem('login', JSON.stringify(login_api.data.data));
            configAction.login_and_logout({ 'bool' : true });

            const url = ['/signup', '/myPage'];
            let url_check = false;
            url.forEach( (el) => {
                if(window.location.pathname.includes(el)) {
                    url_check = true;
                }
            })

            console.log(login_api)
            console.log('-------');
            // return;

            if(url_check) {
                if(login_after !== "") {
                    return window.location.replace(login_after)
                }

                return window.location.replace('/')
            }

            return window.location.reload();
        }

        } else {
            return alert('로그인 중입니다. \n잠시만 기다려주세요.');
        }
    }

    render() {
        const { _modalToggle, _toggleSearchIdAndPw } = this.props;
        const { _logins, _moveSignup } = this;

        return(
            <div id='login_div'>
                <div> </div>
                <div>
                    <h3 className='aCenter'> Login </h3>
                    <img src={img.icon.close_black} id='login_close_icon' 
                        title='로그인 닫기' className='pointer' alt=''
                        onClick={() => _modalToggle(false)}
                    />

                    <form id='login_form' name='login_form' onSubmit={_logins} >
                        <div>
                            <div className='login_form_grid font_14'>
                                <div className='login_other_title_div'> 아이디 </div>
                                <div> <input type='text' maxLength='15' id='login_id_input' name='id'/> </div>
                            </div>

                            <div className='login_form_grid'>
                                <div className='login_other_title_div'> 비밀번호 </div>
                                <div> <input type='password' maxLength='20' autoComplete='true' id='login_pw_input' name='pw'/> </div>
                            </div>
                        </div>

                        <div id='login_button_div'>
                            <div className='aRight font_14'> 
                                <u className='remove_underLine pointer'
                                   onClick={() => _toggleSearchIdAndPw(true, 'id')}
                                > 
                                    아이디 / 비밀번호 찾기 
                                </u> 
                            </div>

                            <input className='pointer'
                                type='submit'
                                value='로그인'
                            />
                        </div>
                    </form>


                    <div id='login_other_div' className='gray'>
                        <div className='aCenter'>
                            회원이 아니신가요?　
                            <u className='pointer black'
                            onClick={_moveSignup}
                            > 
                                회원가입 
                            </u>
                        </div>
                    </div>
                </div>
                <div> </div>
            </div>
        )
    }
}
  
  export default connect(
    (state) => ({
        login_able : state.signup.login_able,
        login_after : state.signup.login_after
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Login);