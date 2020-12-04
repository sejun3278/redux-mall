import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

class Disable extends Component {

    _closeModal = () => {
        const { disable_type, myPageAction } = this.props;

        if(disable_type > 1) {
            if(!window.confirm('창을 닫으면 진행중인 사항들이 모두 취소됩니다. \n닫으시겠습니까?')) {
                return;
            }
        }

        const obj = { 'bool' : false, 'type' : 'search_id' };

        return myPageAction.toggle_modify_other_modal(obj)
    }

    _disableSubmit = async (event) => {
        const { disable_type, _toggleOther, configAction } = this.props;
        const user_info = JSON.parse(this.props.user_info);
        event.preventDefault();

        const form_data = event.target;
        if(disable_type === 1) {
            const id = form_data.id.value.trim();
            const password = form_data.password.value.trim();

            if(id.length === 0) {
                $('input[name=id]').focus();
                return alert('아이디를 입력해주세요.');
            
            } else if(user_info.user_id !== id) {
                $('input[name=id]').focus();
                return alert('로그인 정보와 일치하지 않습니다.');
            
            } else if(password.length === 0) {
                $('input[name=password]').focus();
                return alert('비밀번호를 입력해주세요.');
            }

            const obj = []
            obj[0] = { 'user_id' : id };
            obj[1] = { 'password' : [password, id] };

            const login_check = await axios(URL + '/check/user_data', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(login_check.data === false) {
                return alert('로그인 정보와 일치하지 않습니다.');
            }

            // 이메일 전송하기
            let confirm_number = '';
            let loop_number = Math.trunc(Math.random() * (11 - 6) + 6);

            for(let i = 0; i < loop_number; i++) {
                let code_number = Math.trunc(Math.random() * (10 - 0) + 0);
                confirm_number += String(code_number);
            }

            configAction.set_confirm_number({ 'number' : confirm_number });
            
            const contents = `
            ${confirm_number}
            위의 코드를 입력해주세요.
            `

            const email_obj = {
                'email' : user_info.email,
                'contents' : contents, 
                'title' : 'Sejun\'s Mall 회원탈퇴 이메일 인증 번호입니다.' 
            }
    
            await axios(URL + '/api/send_mail', {
                method : 'POST',
                headers: new Headers(),
                data : email_obj
            })

            return _toggleOther(true, 'disable', 2);

        } else if(disable_type === 2) {
            const email_number = form_data.confirm_number.value.trim();
            const { confirm_number } = this.props;

            if(email_number.length === 0) {
                alert('인증번호를 입력해주세요.');
                return $('input[name=confirm_number]').focus();

            } else if(confirm_number !== email_number) {
                alert('일치하지 않는 인증번호입니다.');
                return $('input[name=confirm_number]').focus();
            }

            return _toggleOther(true, 'disable', 3);
        }
    }

    render() {
        const { disable_type } = this.props;
        const { _closeModal, _disableSubmit } = this;
        const user_info = JSON.parse(this.props.user_info);

        return(
            <div id='disable_div'>
                <h3 className='aCenter border_bottom'> 회원 탈퇴 </h3>
                <img alt='' src={img.icon.close_black} id='close_disable_user_icon' className='aCenter pointer' title='닫기' onClick={_closeModal} />

                <div id='disable_index_div' className='aCenter gray'>
                    <div id={disable_type === 1 ? "disable_select_index" : null}> 1. 로그인 </div>
                    <div id={disable_type === 2 ? "disable_select_index" : null}> 2. 이메일 인증 </div>
                    <div id={disable_type === 3 ? "disable_select_index" : null}> 3. 탈퇴 절차 </div>
                </div>

                <div id='disable_contents_div'>
                    <form onSubmit={_disableSubmit}>
                        {disable_type === 1
                        
                        ? <div id='disable_first_confirm_div'> 
                                <div className='disable_grid_divs'>
                                    <div> 아이디 </div>
                                    <div> <input type='text' maxLength='15' name='id'/> </div>
                                </div>

                                <div className='disable_grid_divs'>
                                    <div> 비밀번호 </div>
                                    <div> <input type='password' maxLength='15' name='password'/> </div>
                                </div>

                                <input className='submit_button' type='submit' value='로그인' />
                        </div>

                        : disable_type === 2
                        
                        ? <div id='disable_second_confirm_div'> 
                            <p className='aCenter font_14'>
                                <b> {user_info.email} </b> 로 전송된 인증번호를
                                <br /> 아래에 입력해주세요.
                            </p>

                            <div id='disable_second_submit_div' className='aCenter'>
                                ▶　<input type='text' maxLength='10' name='confirm_number' className='padding_3' placeholder='인증번호 입력' autoComplete='off'/>

                                <div>
                                    <input type='submit' className='pointer' value='인증' />
                                </div>
                            </div>
                        </div>
                        
                        : disable_type === 3

                        ? <div id='disable_last_confirm_div'>
                            <div id='disable_confirm_index_div'>
                                <h4 className='aCenter'> 회원탈퇴 약관 </h4>
                                <textarea>

                                </textarea>
                            </div>
                            
                            <input type='submit' className='pointer marginTop_30 padding_5' value='탈퇴에 동의합니다.'/>
                          </div>

                        : null
                    }
                    </form>
                </div>
            </div>
        )
    }
}

Disable.defaultProps = {
    disable_type : 1
  }
  
  export default connect(
    (state) => ({
        user_info : state.config.user_info,
        disable_type : state.my_page.disable_type,
        confirm_number : state.config.confirm_number
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Disable);