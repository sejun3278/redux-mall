import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';
import * as configAction from '../../Store/modules/config';
import * as myPageAction from '../../Store/modules/my_page';
import '../../css/responsive/signup.css';

import img from '../../source/img/icon.json'
import $ from 'jquery';
import URL from '../../config/url';

class SearchIDPW extends Component {
    
    _changeInputValue = (type) => {
        const { configAction } = this.props;
        const { search_name, search_email_id, search_email_host, search_id } = this.props;

        const obj = {};
        obj['name'] = search_name;
        obj['email_id'] = search_email_id;
        obj['email_host'] = search_email_host;
        obj['id'] = search_id;

        const str = $('input[name=search_' + type + ']').val().trim();
        obj[type] = str;

        return configAction.set_search_data(obj);
    }

    _submit = async (event) => {
        const { configAction, search_id_pw_type, searching } = this.props;
        const { search_name, search_email_id, search_email_host, search_id } = this.props;

        event.preventDefault();

        if(searching === false) {
            if(search_name.length === 0) {
                alert('이름을 입력해주세요.');
                return $('input[name=search_name]').focus();
            
            } else if(search_id_pw_type === 'pw') {
                if(search_id.length === 0) {
                    alert('아이디를 입력해주세요.');
                    return $('input[name=search_id]').focus();
                }
            
            } else if(search_email_id.length === 0) {
                alert('이메일 아이디를 입력해주세요.');
                return $('input[name=search_email_id]').focus();

            } else if(search_email_host.length === 0) {
                alert('이메일 주소를 입력해주세요.');
                return $('input[name=search_email_host]').focus();
            }

            configAction.searching({ 'bool' : true, 'result' : false })
            const email_str = search_email_id + '@' + search_email_host;
            const qry_arr = [];

            qry_arr.push({ 'columns' : ['user_id'] })
            qry_arr.push({ 'name' : search_name });
            qry_arr.push({ 'email' : email_str });

            if(search_id_pw_type === 'id') {
                // 아이디 찾기
                const id_search = await axios(URL + '/check/user_data', {
                    method : 'POST',
                    headers: new Headers(),
                    data : qry_arr
                })

                if(id_search.data.result === false) {
                    configAction.searching({ 'bool' : false, 'result' : false })
                    return alert('일치되는 데이터가 없습니다.');
                }

                return configAction.searching({ 'bool' : false, 'result' : id_search.data.data[0].user_id })

            } else if(search_id_pw_type === 'pw') {
                // 비밀번호 찾기
                qry_arr[0] = { 'columns' : ['id', 'email'] }
                qry_arr.push({ 'user_id' : search_id });

                const { mypage_url } = this.props;
                if(mypage_url) {
                    const user_info = JSON.parse(this.props.user_info);

                    if(user_info.user_id !== search_id) {
                        configAction.searching({ 'bool' : false, 'result' : false })

                        return alert('현재 회원 정보와 일치하는 정보를 입력해주세요.');
                    }
                }

                const pw_search = await axios(URL + '/check/user_data', {
                    method : 'POST',
                    headers: new Headers(),
                    data : qry_arr
                })

                let pw_result = false;
                if(pw_search.data.result === false) {
                    configAction.searching({ 'bool' : false, 'result' : false })
                    return alert('일치되는 데이터가 없습니다.');
                }

                configAction.save_user_id({ 'id' : pw_search.data.data[0].id })
                
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

                const obj = {
                    'email' : pw_search.data.data[0].email,
                    'contents' : contents, 
                    'title' : 'Sejun\'s Mall 비밀번호 찾기 인증번호 입니다.' 
                }
        
                await axios(URL + '/api/send_mail', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                pw_result = 1;
                configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : pw_result, 'result_id' : pw_search.data.data[0].id })
            }

        } else {
            return alert('조회중입니다. \n잠시만 기다려주세요.');
        }
    }

    _confirmEmail = (event) => {
        const { configAction, confirm_number } = this.props;
        event.preventDefault();

        const form_data = event.target;
        const number = form_data.confirm_number.value.trim();

        if(Number(confirm_number) !== Number(number)) {
            return alert('틀린 인증번호입니다.');
        }
        
        return configAction.searching({ 'pw_result' : 2 })
    }

    _changePassword = async (event) => {
        const { configAction, save_user_id, search_id, mypage_url } = this.props;

        event.preventDefault();
        const form_data = event.target;
        const pass_check = /^[A-za-z]+[a-z0-9]{7,19}$/g; // 비밀번호 체크

        const password = form_data.password.value.trim();
        const password_confirm = form_data.password_confirm.value.trim();

        if(mypage_url) {
            // 비밀번호 확인
            const origin_pw = form_data.now_password.value.trim();

            if(origin_pw.match(pass_check) === null) {
                alert('현재 비밀번호는\n영문자로 시작하는 8~20 글자 사이의 영문 또는 숫자를 입력해주세요.');
                return $('input[name=now_password]').focus();
            }

            const obj = [];
            obj[0] = { 'password' : [origin_pw, search_id, save_user_id] };

            const pw_check = await axios(URL + '/check/user_data', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(!pw_check.data) {
                $('input[name=now_password]').focus();
                return alert('비밀번호가 일치하지 않습니다.');
            }
        }
        
        if(password.match(pass_check) === null) {
            alert('비밀번호는\n영문자로 시작하는 8~20 글자 사이의 영문 또는 숫자를 입력해주세요.');
            return $('input[name=password]').focus();

        } else if(password_confirm.match(pass_check) === null) {
            alert('비밀번호 확인은\n영문자로 시작하는 8~20 글자 사이의 영문 또는 숫자를 입력해주세요.');
            return $('input[name=password_confirm]').focus();

        } else if(password !== password_confirm) {
            return alert('비밀번호와 비밀번호 확인이 동일하지 않습니다.');
        }

        const obj = { 'id' : save_user_id, 'user_id' : search_id };
        obj['password'] = password;
        obj['max'] = 1;

        const update_user_info = await axios(URL + '/update/user_info', {
            method : 'POST',
            headers: new Headers(),
            data : obj
          })

        if(update_user_info.data) {
            return configAction.searching({ 'pw_result' : 3 })
        }
    }

    _mypageURLModalClose = () => {
        // 마이페이지의 비밀번호 변경 창 닫기
        const { myPageAction, configAction, search_result_pw } = this.props;

        if(search_result_pw !== false && search_result_pw !== 3) {
            if(!window.confirm('창을 닫으면 현재 진행한 모든 사항들이 취소됩니다. \n창을 닫으시겠습니까?')) {
                return;
            }
        }

        configAction.searching({ 'pw_result' : false })
        configAction.set_search_data({ 'name' : "", "email_id" : "", "email_host" : "", "id" : "" })
        return myPageAction.toggle_modify_other_modal({ 'bool' : false, 'type' : 'search_pw' })
    }

    render() {
        const { search_id_pw_type, _toggleSearchIdAndPw, _modalToggle, mypage_url } = this.props;
        const { search_name, search_email_id, search_email_host, search_result, search_id, search_result_pw } = this.props;
        const { _changeInputValue, _submit, _confirmEmail, _changePassword, _mypageURLModalClose } = this;

        let title = '아이디 / 비밀번호 찾기';
        let pw_button = '비밀번호 찾기'

        if(mypage_url) {
            title = '비밀번호 변경';
            pw_button = '비밀번호 변경'
        }

        return(
            <div id='search_id_and_pw_div'>
                <h3 id='search_id_and_pw_title' className='aCenter border_bottom'> 
                    {title}
                </h3>

                <img src={img.icon.close_black} id='login_close_icon' 
                        title='닫기' className='pointer' alt=''
                        onClick={mypage_url === false
                                        ? () => _toggleSearchIdAndPw(false, 'id')
                                        : _mypageURLModalClose
                        }
                    />

                <div id='select_search_type_div' className='aCenter gray'>
                    {mypage_url === false ? 
                        <div id='select_search_type_style_div' className='grid_half border_bottom'>
                            <div id='search_id_div' className={search_id_pw_type === 'id' ? 'black bold' : null}
                                onClick={search_id_pw_type === 'id' ? null : () => _toggleSearchIdAndPw(true, 'id')}
                            > 
                                아이디 찾기 
                            </div>

                            <div className={search_id_pw_type === 'pw' ? 'black bold' : null}
                            onClick={search_id_pw_type === 'pw' ? null : () => _toggleSearchIdAndPw(true, 'pw')}> 
                                비밀번호 찾기 
                            </div>
                        </div>

                    :   null
                    }


                </div>

                <div id='search_contents_divs'>
                    { search_id_pw_type === 'id'
                        ? search_result === false ?
                        <div className='search_contents_div_style'>
                            <div />
                            <div>
                                <form name='id_search_form' onSubmit={_submit}>
                                    <div className='search_contents_grid_div'>
                                        <div> 이름 </div>
                                        <div> 
                                            <input type='text' maxLength='15' name='search_name' defaultValue={search_name} 
                                                   onChange={() => _changeInputValue('name')}
                                            /> 
                                        </div>
                                    </div>

                                    <div className='search_contents_grid_div'>
                                        <div> 이메일 </div>
                                        <div className='search_email_input_div'> 
                                            <input type='text' maxLength='15' name='search_email_id' defaultValue={search_email_id} 
                                                   onChange={() => _changeInputValue('email_id')}
                                            /> 
                                            　@　
                                            <input type='text' maxLength='15' name='search_email_host' defaultValue={search_email_host} 
                                                   onChange={() => _changeInputValue('email_host')}
                                            /> 
                                        </div>
                                    </div>

                                    <div className='search_submit_div'>
                                        <input type='submit' className='pointer' value='아이디 조회' />
                                    </div>
                                </form>
                            </div>
                            <div />
                          </div>

                        : <div id='search_id_result_div'>
                            <div className='aCenter'>
                                조회하신 아이디는
                                <p className='marginTop_10'> <b> {search_result} </b> 입니다. </p> 
                            </div>

                            <div id='search_other_div' className='grid_half aCenter border_top font_14'>
                                <div> 
                                    <u className='pointer remove_underLine' onClick={() => _toggleSearchIdAndPw(false, 'id')}> 돌아가기 </u> 
                                </div>

                                <div>
                                    <u className='pointer remove_underLine' onClick={() => _toggleSearchIdAndPw(true, 'pw')}> 비밀번호 찾기 </u> 
                                </div>
                            </div>
                          </div>

                        : search_id_pw_type === 'pw'

                        ? search_result_pw === false ? 
                        <div className='search_contents_div_style'>
                            <div />
                            <div>
                                <form name='id_search_form' onSubmit={_submit}>
                                    <div className='search_contents_grid_div'>
                                        <div> 이름 </div>
                                        <div> 
                                            <input type='text' maxLength='15' name='search_name' defaultValue={search_name} 
                                                   onChange={() => _changeInputValue('name')}
                                            /> 
                                        </div>
                                    </div>

                                    <div className='search_contents_grid_div'>
                                        <div> 아이디 </div>
                                        <div> 
                                            <input type='text' maxLength='15' name='search_id' defaultValue={search_id} 
                                                   onChange={() => _changeInputValue('id')}
                                            /> 
                                        </div>
                                    </div>

                                    <div className='search_contents_grid_div'>
                                        <div> 이메일 </div>
                                        <div className='search_email_input_div'> 
                                            <input type='text' maxLength='15' name='search_email_id' defaultValue={search_email_id} 
                                                   onChange={() => _changeInputValue('email_id')}
                                            /> 
                                            　@　
                                            <input type='text' maxLength='15' name='search_email_host' defaultValue={search_email_host} 
                                                   onChange={() => _changeInputValue('email_host')}
                                            /> 
                                        </div>
                                    </div>

                                    <div className='search_submit_div'>
                                        <input type='submit' className='pointer' value={pw_button} />
                                    </div>
                                </form>
                            </div>
                            <div />
                          </div>

                        : search_result_pw === 1
                            ? <div id='search_pw_email_check_div' className='search_pw_title_style'>
                                <h3 className='aCenter'> 이메일 인증 </h3>

                                <div id='search_pw_email_contents_div' className='aCenter'>
                                    <p> <b> {search_email_id + '@' + search_email_host} </b> 에 </p>
                                    <p> 인증번호를 전송했습니다. </p>

                                    <div id='search_pw_comfirm_div'>
                                        <form name='search_pw_form' onSubmit={_confirmEmail}>
                                            <input className='padding_3' name='confirm_number' type='text' maxLength='10' placeholder='인증번호 입력' />
                                            <input type='submit' className='pointer' id='email_confirm_button' value='인증' />
                                        </form>
                                    </div>
                                </div>
                            </div>

                            : search_result_pw === 2

                            ? <div id='search_change_password_div' className='search_pw_title_style'>
                                <h3 className='aCenter'> 비밀번호 변경 </h3>

                                <div id='search_pw_change_pw_div'>
                                    <form name='change_pw_form' onSubmit={_changePassword}>
                                        {mypage_url 
                                            ?
                                            <div className='change_pw_divs'>
                                                <div className='aRight'> 현재 비밀번호 </div>
                                                <div> <input type='password' name='now_password' placeholder='현재 비밀번호를 입력해주세요.' /> </div>
                                            </div>
                                        
                                            : null
                                        }

                                        <div className='change_pw_divs'>
                                            <div className='aRight'> 비밀번호 </div>
                                            <div> <input type='password' name='password' placeholder='변경할 비밀번호를 입력해주세요.'/> </div>
                                        </div>

                                        <div className='change_pw_divs'>
                                            <div className='aRight'> 비밀번호 확인 </div>
                                            <div> <input type='password' name='password_confirm' autoComplete="on" placeholder='변경할 비밀번호를 한번 더 입력해주세요.'/> </div>
                                        </div>

                                        <input id='change_password_button' className='pointer' type='submit' value='비밀번호 변경' autoComplete="on"/>

                                    </form>
                                </div>
                              </div>

                            : search_result_pw === 3 

                            ? <div id='change_pw_result_div'>
                                <h4 className='aCenter border_bottom'> 비밀번호를 변경했습니다. </h4> 

                                {mypage_url === false ?
                                    <div id='change_pw_other_div' className='grid_half aCenter'>
                                        <div> <u onClick={() => _toggleSearchIdAndPw(false, 'id')} className='remove_underLine pointer'> 로그인 </u> </div>
                                        <div> <u onClick={() => _modalToggle(false)} className='remove_underLine pointer'> 닫　기 </u> </div>
                                    </div>
                                : 
                                    <div className='aCenter'>
                                        <u onClick={_mypageURLModalClose} className='remove_underLine pointer'> 닫　기 </u>
                                    </div>
                                }
                              </div>

                            : null

                        : null
                    }
                </div>
            </div>
        )
    }
}

SearchIDPW.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        user_info : state.config.user_info,
        search_id_pw_type : state.config.search_id_pw_type,
        search_name : state.config.search_name,
        search_name : state.config.search_name,
        search_email_id : state.config.search_email_id,
        search_email_host : state.config.search_email_host,
        search_id : state.config.search_id,
        searching : state.config.searching,
        search_result : state.config.search_result,
        search_result_pw : state.config.search_result_pw,
        confirm_number : state.config.confirm_number,
        save_user_id : state.config.save_user_id,
        mypage_url : state.config.mypage_url
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(SearchIDPW);