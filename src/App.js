import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Route, Switch } from 'react-router-dom';

import * as signupAction from './Store/modules/signup';
import * as configAction from './Store/modules/config';
import * as adminAction from './Store/modules/admin';

// import Header from './page/header';
// import Signup from './page/body/signup';
// import Login from './page/body/login';
// import SignupComplate from './page/body/signup_complate';

import { MyPageHome, ModifyUser } from './page/body/my_page/index';
import { AdminHome, AdminCategory, AdminGoodsWriteOther } from './page/body/admin/index';
import { Header, Login, Signup, SignupComplate } from './page/index';

import category_list from './source/admin_page.json';

import URL from './config/url.js';

const customStyles = {
  content : {
    top                   : '230px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '400px',
    backgroundColor       : '#394867'
  }
};

Modal.setAppElement('body')

class App extends Component {
  componentDidMount() {
    const { configAction } = this.props;
    
    this._callServerStatus();

    const login_check = JSON.parse(sessionStorage.getItem('login'));
    if(login_check) {
      configAction.login_and_logout({ 'bool' : true });

      // 유저 정보 담기
      this._getLoginInfo(login_check);

      // 관리자 확인
      this._checkAdmin(login_check)
    }
  }

  componentDidUpdate() {
    this._checkLogin();
  }

  _checkAdmin = async (info) => {
    const get_admin_info = await axios(URL + '/get/admin_info', {
      method : 'POST',
      headers: new Headers(),
      data : { id : info.id, user_id : info.user_id }
    })

    if(get_admin_info.data === true) {
      this.props.configAction.save_admin_info({ 'info' : get_admin_info.data })
      return true;
    }
    return false;
  }

  _getLoginInfo = async (info) => {
    const get_user_info = await axios(URL + '/get/user_info', {
      method : 'POST',
      headers: new Headers(),
      data : { id : info.id, user_id : info.user_id }
    })

    if(!get_user_info.data) {
      alert('잘못된 로그인 방식입니다. \n다시 로그인을 시도해주세요.');
      sessionStorage.removeItem('login');

      return window.location.replace('/');
    }

    return this.props.configAction.save_user_info({ 'info' : JSON.stringify(get_user_info.data) })
  }

  _callServerStatus = async() => {
    const res = await axios.get(URL + '/test');
    console.log(res)
  }

  _pageMove = (type, location) => {
    // type
    // href = '뒤로가기 가능'
    // replace = '뒤로가기 불가'

    if(type === 'href') {
      return window.location.href = location;

    } else if(type === 'replace') {
      return window.location.replace(location);
    }
  }

  _modalToggle = (bool) => {
    const { signupAction } = this.props;

    return signupAction.modal_toggle({ 'bool' : bool })
  }

  // 로그인 체크
  _checkLogin = () => {
    const login_check = JSON.parse(sessionStorage.getItem('login'));
    if(login_check) {
      this.props.configAction.login_and_logout({ 'bool' : true });

      // 유저 정보 담기
      this._getLoginInfo(login_check);

      // 관리자 확인
      this._checkAdmin(login_check)
    }
  }

  // category 이름 찾기
  _searchCategoryName = (val, type, first) => {
    //category_list
    let result = '';
    let foreach_target = '';
    if(type === 'first') {
      foreach_target = category_list.first_category.category;

    } else if(type === 'last') {
      foreach_target = category_list.last_category[first];
    }

    foreach_target.forEach( (el) => {
      if(val === el.value) {
        result = el.name;
      }
    })

    return result;
  };

  render() {
    const { login_modal, admin_info, login, admin_state } = this.props;
    const { _pageMove, _modalToggle, _checkAdmin, _checkLogin, _searchCategoryName } = this;

    const user_info = JSON.parse(sessionStorage.getItem('login'));

    const now_url = document.location.href.split('/');
    let cat_name = '';

    let detail_url = '';

    if(now_url[4] !== undefined) {
      detail_url = now_url[4].split('?')[0];
    }

    if(now_url[3] === 'admin') {
      if(now_url[4] === undefined || detail_url === 'goods') {
        cat_name = '상품 관리';

      } else if(now_url[5] === 'goods_write') {
        cat_name = '상품 등록';
      
      } else if(now_url[4] === 'order' || detail_url === 'order') {
        cat_name = '주문 관리';
      
      } else if(now_url[4] === 'delivery') {
        cat_name = '배송 관리';

      } else if(now_url[4] === 'user') {
        cat_name = '회원 관리';
      }
  }

  console.log(cat_name)
  
    return(
      <div className='App'>
        {user_info && !login
        
        ? <div> </div>
        
        :
        <div>
          <Header 
          _pageMove={_pageMove}
          _modalToggle={_modalToggle}
          admin_info={admin_info}
        />

        <div id='body_div'>
          <div id='body_div_left'>
            {user_info && login && admin_state ?
            <div>
              <Route path='/admin' 
                    render={(props) => <AdminCategory
                      cat_name={cat_name}
                      _pageMove={_pageMove}
                    {...props} 
              />}
              />
            </div>
            : null}

          </div>
          {/* */}

          <div id='body_div_center'>
            <Modal
              isOpen={login_modal}
              // onAfterOpen={afterOpenModal}
              onRequestClose={() => _modalToggle(false)}
              style={customStyles}
              // contentLabel="Example Modal"
            >
              <Login 
                _pageMove={_pageMove}
                _modalToggle={_modalToggle}
              />
            </Modal>

            <Switch>
              <Route path='/admin'
                     render={(props) => <AdminHome 
                      cat_name={cat_name}
                      login={login}
                      user_info={user_info}
                      _checkAdmin={_checkAdmin}
                      admin_info={admin_info}
                      _checkLogin={_checkLogin}
                      _pageMove={_pageMove}
                      _searchCategoryName={_searchCategoryName}
                    {...props} 
              />}
            />

              <Route exact path='/signup' 
                     render={(props) => <Signup 
                      login={login}
                      user_info={user_info}
                        {...props} 
                />}
              />
              <Route path='/signup/complate/:id' 
                     render={(props) => <SignupComplate 
                        _pageMove={_pageMove} 
                        _modalToggle={_modalToggle}
                        {...props} 
                />}
              />

              <Route path='/myPage/modify_user' 
                     render={(props) => <ModifyUser
                        {...props} 
                />}
              /> {/* 회원 정보 수정 */}

              <Route path='/myPage' 
                     render={(props) => <MyPageHome
                     login={login}
                     user_info={user_info}
                        {...props} 
                />}
              />
            </Switch>
          </div>

          <div id='body_div_right'></div>
          </div>
        </div>
      }
      </div>
    )
  }
}

App.defaultProps = {
}

export default connect(
  (state) => ({
    login_modal : state.signup.login_modal,
    login : state.config.login,
    admin_info : state.config.admin_info,
    admin_state : state.admin.admin_state,
  }), 
  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch),
    adminAction : bindActionCreators(adminAction, dispatch)
  })
)(App);