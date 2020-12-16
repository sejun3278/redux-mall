import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
// import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Route, Switch } from 'react-router-dom';

import * as signupAction from './Store/modules/signup';
import * as configAction from './Store/modules/config';
import * as adminAction from './Store/modules/admin';

import { MyPageHome } from './page/body/my_page/index';
import { AdminHome, AdminCategory } from './page/body/admin/index';
import { Header, Login, Signup, SignupComplate, TopCategory, SearchIDPW, Search } from './page/index';

import category_list from './source/admin_page.json';
import { Loading, Goods } from './page/index';

import URL from './config/url.js';
import $ from 'jquery';

const customStyles = {
  content : {
    top                   : '300px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '400px',
  }
};

Modal.setAppElement('body')

class App extends Component {
  async componentDidMount() {
    const { configAction, loading } = this.props;

    // 로그인 체크하기
    this._checkLogin();

    if(!loading) {
      // configAction.set_loading();
    }
  }

  componentDidUpdate() {
    const { loading, user_info } = this.props;
    // this._checkLogin();

    if(loading === true && user_info === null) {
    }
  }

  // 쿠키 출력하기
  _getCookie = async (key, type, value, opt) => {
    const login_cookie = await axios(URL + '/get/cookie_data', {
      method : 'POST',
      headers: new Headers(),
      data : { 'key' : key, 'type' : type, 'value' : value, 'opt' : opt }
    })

    if(login_cookie.status === 500) {
      return window.location.reload();
    }

    if(login_cookie.data) {
      return login_cookie.data;

    } else {
      return false;
    }
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
    const { configAction } = this.props;
    const get_user_info = await axios(URL + '/get/user_info', {
      method : 'POST',
      headers: new Headers(),
      data : { id : info.id, user_id : info.user_id }
    })

    console.log(get_user_info)
    return;

    if(!get_user_info.data) {
      alert('잘못된 로그인 방식입니다. \n다시 로그인을 시도해주세요.');
      // sessionStorage.removeItem('login');
      this._getCookie('login', 'remove')

      return window.location.replace('/');
    }

    return configAction.save_user_info({ 'info' : JSON.stringify(get_user_info.data) })
  }

  _pageMove = (type, location) => {
    const { login_after } = this.props;
    // type
    // href = '뒤로가기 가능'
    // replace = '뒤로가기 불가'

    let move_url = location;
    if(login_after !== "") {
      move_url = login_after;
    }

    if(type === 'href') {
      return window.location.href = move_url;

    } else if(type === 'replace') {
      return window.location.replace(move_url);
    }
  }

  _modalToggle = (bool) => {
    const { signupAction, configAction } = this.props;

    if(bool === false) {
      signupAction.set_login_after({ 'url' : "" })
      configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : false, 'result_id' : "" })
      configAction.toggle_search_id_and_pw({ 'bool' : false, 'type' : 'id' })
    }

    return signupAction.modal_toggle({ 'bool' : bool })
  }

  // 로그인 체크
  _checkLogin = async () => {
    const { configAction } = this.props;

    const login_cookie = await this._getCookie('login', 'get');
    console.log(login_cookie)

    if(login_cookie) {
      console.log(123)
      configAction.login_and_logout({ 'bool' : true });

      // 유저 정보 담기
      // this._getLoginInfo(login_cookie);
      configAction.save_user_info({ 'info' : JSON.stringify(login_cookie) })

      // 관리자 확인
      this._checkAdmin(login_cookie)

    } else {
      configAction.save_user_info({ 'info' : false })
    }

    return configAction.set_loading();
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

  _toggleSearchIdAndPw = (bool, type) => {
    const { configAction } = this.props;
    const obj = { 'bool' : bool, 'type' : type };

    if(bool === false) {
      const data_obj = { 'name' : "", "email_id" : "", "email_host" : "" }
      configAction.set_search_data(data_obj);
      configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : false, 'result_id' : "" })
    }

    return configAction.toggle_search_id_and_pw(obj);
  }

  // 검색
  _search = (event) => {
    event.preventDefault();

    const form_data = event.target;
    const search = form_data.search.value.trim();

    return window.location.href='/search/?search=' + search;
  }

  // 숫자에 컴마 입력
  price_comma = (price) => {
    const change = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return change;
  }

  // url 필터
  _filterURL = (qry, route) => {
    let url = route === null ? "" : route;
    let start_str = '?';

    for(let key2 in qry) {
      if(qry[key2] !== null) {
        url += start_str + key2 + '=' + qry[key2];
        start_str = '&';
      }
    }

    return window.location.href = url;
  }

  // 카테고리 클릭시 url 설정
  _clickCategory = (qry, first, last) => {
    qry['first_cat'] = first;

    if(last) {
        qry['last_cat'] = last;
    } else {
        qry['last_cat'] = null;
    }

    return this._filterURL(qry, '/search');
  }

  // 스크롤 이동
  _moveScrollbar = (target, type, val) => {
    if(type === 'x') {
      return $(target).scrollLeft(val);

    } else if(type === 'y') {
      return $(target).stop().animate({ scrollTop : val });
    }
  }

  render() {
    const { login_modal, admin_info, login, admin_state, search_id_pw_modal, loading } = this.props;
    const { _pageMove, _modalToggle, _checkAdmin, _checkLogin, _searchCategoryName, _toggleSearchIdAndPw, _search, price_comma, _filterURL, _clickCategory, _moveScrollbar, _getCookie } = this;
    const user_info = JSON.parse(this.props.user_info);

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

    return(
      <div className='App'>
          {loading === false && user_info === null
          
          ? <Loading />
          
          :
          <div>
            {/* {JSON.stringify(user_info)} */}
            <Header
              user_info={user_info}
              _pageMove={_pageMove}
              _modalToggle={_modalToggle}
              admin_info={admin_info}
              _search={_search}
              _getCookie={_getCookie}
          />

          <div>
            <Route path='/'
                render={(props) => <TopCategory
                    cat_name={cat_name}
                    _pageMove={_pageMove}
                    _filterURL={_filterURL}
                    _clickCategory={_clickCategory}
                    _moveScrollbar={_moveScrollbar}
                  {...props}  />}
            />
          </div>

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
                onRequestClose={!search_id_pw_modal ? () => _modalToggle(false) : null}
                style={customStyles}
                // contentLabel="Example Modal"
              >
                {!search_id_pw_modal
                ?
                  <Login 
                    _pageMove={_pageMove}
                    _modalToggle={_modalToggle}
                    _toggleSearchIdAndPw={_toggleSearchIdAndPw}
                  />

                : <SearchIDPW
                    _modalToggle={_modalToggle}
                    _toggleSearchIdAndPw={_toggleSearchIdAndPw}
                />
                }

              </Modal>
              
              <Switch>
                {user_info !== null ? 
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
                          price_comma={price_comma}
                        {...props} 
                  />}
                />
              : null}

                <Route path='/search' 
                      render={(props) => <Search
                        _search={_search}
                        _searchCategoryName={_searchCategoryName}
                        price_comma={price_comma}
                        _filterURL={_filterURL}
                        _clickCategory={_clickCategory}
                        _moveScrollbar={_moveScrollbar}
                        _modalToggle={_modalToggle}
                        user_info={user_info}
                        // cat_name={cat_name}
                        // _pageMove={_pageMove}
                      {...props} 
                  />}
                />

                <Route path='/goods'
                      render={(props) => <Goods
                        admin_info={admin_info}
                        _searchCategoryName={_searchCategoryName}
                        _pageMove={_pageMove}
                        price_comma={price_comma}
                        _modalToggle={_modalToggle}
                        _getCookie={_getCookie}
                        _moveScrollbar={_moveScrollbar}
                      {...props} 
                  />}
                />
              
                <Route exact path='/signup' 
                      render={(props) => <Signup 
                        login={login}
                        user_info={user_info}
                        _getCookie={_getCookie}
                          {...props} 
                  />}
                />
                <Route path='/signup/complate/:id' 
                      render={(props) => <SignupComplate 
                          _pageMove={_pageMove} 
                          _modalToggle={_modalToggle}
                          login={login}
                          user_info={user_info}
                          _getCookie={_getCookie}
                          {...props} 
                  />}
                />

                <Route path='/myPage'
                      render={(props) => <MyPageHome
                      login={login}
                      user_info={user_info}
                      _getCookie={_getCookie}
                      price_comma={price_comma}
                      _modalToggle={_modalToggle}
                      {...props} 
                  />}
                />
              </Switch>
            </div>

            <div id='body_div_right'></div>
            </div>
          </div>
        }
        {/* </div>  */}
      {/* // : null } */}
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
    user_info : state.config.user_info,
    login_after : state.signup.login_after,
    search_id_pw_modal : state.config.search_id_pw_modal,
    search_id_pw_type : state.config.search_id_pw_type,
    select_cat_open : state.config.select_cat_open,
    loading : state.config.loading
  }), 
  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch),
    adminAction : bindActionCreators(adminAction, dispatch)
  })
)(App);