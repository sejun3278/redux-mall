import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';

import '../../css/responsive/signup.css';

class Signup_complate extends Component {

  async componentDidMount() {
    // 접근 체크하기
    await this._checkSignupId();
  }

  _checkSignupId = async () => {
    const { match, _getCookie, signupAction } = this.props;

    const id = match.params.id;
    const check_cookie = await _getCookie('signup', 'get');

    let allow = true;
    if(!check_cookie.id || id !== check_cookie.id) {
      allow = false;
      alert('정상적인 접근이 아닙니다.');
    }

    if(allow === false) {
      return window.location.replace('/');
    }

    await _getCookie('signup', 'remove');    
    return signupAction.save_signup_id({ 'id' : check_cookie.id });
  }

  // 회원 정보 수정 클릭시
  _moveModifyUserInfo = () => {
    const { user_info, _modalToggle, signupAction } = this.props;

    if(user_info) {
      // 이미 로그인된 상태라면
      alert('정상적인 접근이 아닙니다.');

      return window.location.replace('/');

    } else {
      signupAction.set_login_after({ 'url' : '/myPage/modify_user' })

      _modalToggle(true);
    }
  }

    render() {
      const { _pageMove, _modalToggle, signup_id, save_signup_id } = this.props;
      const { _moveModifyUserInfo } = this;

      console.log(signup_id)
      console.log(save_signup_id)

        return(
            <div id='signup_complate_div'>
              {signup_id ? 
              <div>
                <h3> 회원가입 완료 </h3>

                <p> 
                  <b> {signup_id} </b> 님 회원가입을 환영합니다 ! 
                </p>

                <div id='signup_complate_select_div' className='aCenter'>
                  <div onClick={() => _pageMove('replace', '/')}> <u className='remove_underLine pointer'> 홈으로 </u></div>
                  <div>
                    <u className='remove_underLine pointer'
                      onClick={() => _modalToggle(true)}
                    > 
                      로그인 
                    </u> 
                  </div>
                  <div>
                    <u className='remove_underLine pointer'
                      onClick={() => _moveModifyUserInfo()}
                    > 
                      회원정보 수정 
                    </u>
                  </div>
                </div>
              </div>

              : null}
            </div>
        )
    }
}

Signup_complate.defaultProps = {
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
      signup_id : state.signup.signup_id
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Signup_complate);