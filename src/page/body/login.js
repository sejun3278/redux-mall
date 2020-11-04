import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';
import * as configAction from '../../Store/modules/config';

import '../../css/responsive/signup.css';
import img from '../../source/img/icon.json';
import URL from '../../config/url';

import $ from 'jquery';

class Login extends Component {

    _moveSignup = () => {
        const { signupAction, _pageMove } = this.props; 

        signupAction.modal_toggle({ 'bool' : false })
        return _pageMove('replace', '/signup')
    }

    _logins = async () => {
        const { signupAction, configAction } = this.props; 

        const id = String($('#login_id_input').val());
        const pw = String($('#login_pw_input').val());

        if(id.length === 0) {
            return alert('아이디를 입력해주세요.')

        } else if(pw.length === 0) {
            return alert('비밀번호를 입력해주세요.')
        }   
        
        signupAction.login_toggle({ 'bool' : false })
        const data = { id : id, pw : pw };
        const login_api = await axios(URL + '/api/login', {
          method : 'POST',
          headers: new Headers(),
          data : data
        })

        console.log(login_api)

        if(!login_api.data.bool) {
            signupAction.login_toggle({ 'bool' : true })
            return alert('아이디 및 비밀번호를 다시 확인해주세요.');
        
        } else {
            sessionStorage.setItem('login', JSON.stringify(login_api.data.data));

            configAction.login_and_logout({ 'bool' : true });
            return window.location.reload();
        }
    }



    render() {
        const { login_able } = this.props;

        return(
            <div id='login_div' className='aCenter white'>
                <h3> Login </h3>
                <img src={img.icon.close_white} id='login_close_icon' 
                     title='로그인 닫기' className='pointer' alt=''
                     onClick={() => this.props._modalToggle(false)}
                />

                <form id='login_form'>
                    <div>
                        아이디
                        <p> 
                            <input type='text' maxLength='15' id='login_id_input'

                            /> 
                        </p>
                    </div>

                    <div>
                        비밀번호
                        <p> 
                            <input type='password' maxLength='20' autoComplete='true' id='login_pw_input'

                            /> 
                        </p>
                    </div>
                </form>

                <div id='login_button_div'> 
                    <button className='pointer'
                            onClick={login_able ? this._logins : null}
                    > 
                        로그인 
                    </button>
                </div>

                <div id='login_other_div' className='gray'>
                    <div> </div>
                    <div> 
                        <u className='remove_underLine pointer'
                           onClick={this._moveSignup}
                        > 
                            회원가입 
                        </u> 
                    </div>
                    <div> 　|　</div>
                    <div> 아이디 / 비밀번호 찾기 </div>
                    <div> </div>
                </div>
            </div>
        )
    }
}
  
  export default connect(
    (state) => ({
        login_able : state.signup.login_able
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Login);