import React, { Component } from 'react';
import { MyPage, ModifyUser, LikeList, Cart } from './index';
import { Route, Switch } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../../Store/modules/signup';
import * as configAction from '../../../Store/modules/config';

// import img from '../../../source/img/icon.json';
import page_list from '../../../source/myPage.json';

import '../../../css/responsive/signup.css';
import icon from '../../../source/img/icon.json';

class MyPageHome extends Component {

    componentDidMount() {
        // 로그인 체크
        const { user_info } = this.props;

        if(!user_info) {
            return window.location.replace('/');
        }
    }

    render() {
        const { user_info, _getCookie, price_comma, _modalToggle } = this.props;

        const qry = this.props.location.pathname;
        const path = qry.split('/')[2];

        let page_name = "마이 페이지"
        let page_icon = icon.my_page.my_page
        if(path !== undefined) {
            page_name = page_list.myPage.page_name[path];
            page_icon = icon.my_page[path +  '_black']
        }

        return(
            <div id='my_page_div'>
                {user_info ? <div>
                <div id='my_page_title_div' className='my_page_title border_bottom'>
                    <img src={page_icon}/>
                    <b className='aCenter'> {page_name} </b>
                </div>
                
                <Switch>
                    {/* 마이페이지 홈 */}
                    <Route path='/myPage' exact
                        render={(props) => <MyPage
                            user_info={user_info}
                        {...props}  />}
                    />

                    {/* 유저 정보 수정 */}
                    <Route path='/myPage/modify_user'
                        render={(props) => <ModifyUser
                            user_info={user_info}
                            _getCookie={_getCookie}
                        {...props}  />}
                    />

                    {/* 찜 리스트 */}
                    <Route path='/myPage/like_list'
                        render={(props) => <LikeList
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                        {...props}  />}
                    />

                    {/* 장바구니 */}
                    <Route path='/myPage/cart'
                        render={(props) => <Cart
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                        {...props}  />}
                    />


                </Switch>

                </div> : null}
            </div>
        )
    }
}

MyPageHome.defaultProps = {
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
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(MyPageHome);