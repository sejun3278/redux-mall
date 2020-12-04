import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../Store/modules/signup';

import '../../css/responsive/signup.css';

class Signup_complate extends Component {

  componentDidMount() {
    // const { user_info } = this.props;
    // const check = sessionStorage.getItem('signup')

    // if(!check) {
    //   alert('허용되지 않는 접근입니다.');

    //   return window.location.replace('/');
    // }

    // sessionStorage.removeItem('signup');
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
      const { _pageMove, _modalToggle } = this.props;
      const { _moveModifyUserInfo } = this;
      const id = this.props.match.params.id;

      const check = sessionStorage.getItem('signup')

        return(
            <div id='signup_complate_div'>
              {check ? 
              <div>
                <h3> 회원가입 완료 </h3>

                <p> 
                  <b> {id} </b> 님 회원가입을 환영합니다 ! 
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
      alert_obj : state.signup.alert_obj
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Signup_complate);