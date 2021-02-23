import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import { Route, Switch } from 'react-router-dom';
import { 
    PassAdmin, AdminGoodsWrite, AdminCategory, AdminGoods, AdminOrder, AdminUser
} from './index';

import $ from 'jquery';
import img from '../../../source/img/icon.json'
import URL from '../../../config/url';

const customStyles = {
    content : {
      top                   : '230px',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      minWidth              : '300px',
      width                 : '40%',
      border                : 'solid 2px black',
      minHeight             : '100px'
    }
  };

class AdminHome extends Component {

    async componentDidMount() {
        const { login, _checkLogin, adminAction, _getCookie, _hashString } = this.props;
        const user_info = await _checkLogin();

        $('body').css({ 'minWidth' : '1500px' })

        if(!user_info || !login) {
            return window.location.replace('/');

        } else {
            if(user_info.admin !== 'Y') {
                alert('관리자만 접근할 수 있습니다.');
                return window.location.replace('/');
            }
        }

        const cookie_name = _hashString('admin_check');
        let check_cookie = JSON.parse(await _getCookie(cookie_name, 'get', null, true));

        // 이미 인증을 했는지 검색
        if(check_cookie) {
            const select_obj = { 'type' : 'SELECT', 'table' : 'admin_login', 'comment' : '관리자 로그인 로그와 비교하기' };
            
            select_obj['option'] = {};
            select_obj['option']['user_id'] = '=';

            select_obj['where'] = [];
            select_obj['where'].push({ 'table' : 'admin_login', 'key' : 'user_id', 'value' : user_info.id });

            select_obj['order'] = [];
            select_obj['order'][0] = { 'table' : 'admin_login', 'key' : 'id', 'value' : "DESC" };
            select_obj['order'][1] = { 'table' : 'admin_login', 'key' : 'limit', 'value' : "1" };

            const get_login_log = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : select_obj
            });
            const result = get_login_log.data[0][0];

            let allow = true;
            if(user_info.id !== result.user_id) {
                allow = false;

            } else {
                const ld_check = check_cookie[_hashString('admin_id')] === _hashString(result.user_id);
                const code_check = check_cookie[_hashString('code')] === _hashString(result.code);

                if(ld_check !== true && code_check !== true) {
                    allow = false;
                }
            }

            if(allow === false) {
                alert('관리자 인증 내역이 일치하지 않습니다.');

                _getCookie(cookie_name, 'remove', null, true);

                return window.location.replace('/');

            } else if(allow === true) {
                adminAction.login_admin({ 'loading' : true, 'bool' : true });
            }

        } else {
            // 인증 쿠키가 없다면 인증 페이지로 이동
            adminAction.login_admin({ 'loading' : true });
        }
    }

    // _getAdminCheck = async () => {
    //     // 관리자 인증 확인하기
    //     // const all_cookies = await this.props._getAllCookies();
    //     const admin_session = sessionStorage.getItem('admin');

    //     if(admin_session) {
    //         return true;
    //     }
    //     return false;
    // }

    // 목록 Modal Toggle
    _listModalToggle = (bool) => {
        const { adminAction } = this.props;
        
        adminAction.list_modal_toggle({ 'bool' : bool })
    }

    // 관리자 체크
    _checkAdmin = async () => {
        const { _checkLogin } = this.props;
        const user_info = await _checkLogin();
        
        if(user_info.admin === 'Y') {
            return true;

        } else {
            alert('관리자 권한이 없습니다.');
            return window.location.replace('/');
        }
    }

    render() {
        const { 
            admin_info, user_info, login, _checkLogin, admin_state, _pageMove, _filterURL, _searchStringColor,
            list_modal, cat_name, _searchCategoryName, price_comma, admin_loading, _getCookie, _hashString, _setModalStyle,
            _setGoodsStock, _setPoint, _sendMailer, _addAlert
        } = this.props;
        const { _checkAdmin } = this;

        return(
            <div id='admin_page_div'>
                {admin_loading === true 
                ?

                user_info && user_info.admin === 'Y'
                
                ? admin_state === null ? 
                                        <div>
                                            <PassAdmin 
                                                user_info={user_info}
                                                _checkAdmin={_checkAdmin}
                                                _checkLogin={_checkLogin}
                                                login={login}
                                                _getCookie={_getCookie}
                                                admin_info={admin_info}
                                                _hashString={_hashString}
                                                _sendMailer={_sendMailer}
                                            />
                                        </div>

                                       : <div id='admin_home_grid_div'>
                                            <div id='responsive_admin_category_div' className='display_none border_right'>
                                                <AdminCategory _pageMove={_pageMove} />
                                            </div>

                                            <div id='admin_contents_div'>
                                                <div id='mobile_admin_category_div' className='display_none border_bottom aCenter border_right pointer'
                                                        onClick={() => this._listModalToggle(true)}
                                                >
                                                    목록
                                                </div>

                                                <Modal
                                                    isOpen={list_modal}
                                                    // onAfterOpen={afterOpenModal}
                                                    onRequestClose={() => this._listModalToggle(false)}
                                                    style={customStyles}
                                                    // contentLabel="Example Modal"
                                                >
                                                    <div id='admin_list_modal_div'>
                                                        <h4 className='aCenter border_bottom'> 관리자 목록 </h4>
                                                        <img src={img.icon.close_black} id='admin_list_close_button' className='pointer'
                                                             onClick={() => this._listModalToggle(false)} alt=''
                                                        />
                                                        <AdminCategory                                                             
                                                            cat_name={cat_name}
                                                            _pageMove={_pageMove}
                                                        /> 
                                                    </div>
                                                </ Modal>

                                                <div className='my_page_title' id='admin_page_titles'>
                                                    <h3> {cat_name} </h3>
                                                </div>

                                                <div id='admin_page_contents_div'>
                                                    <Switch>
                                                        <Route path='/admin' exact
                                                            render={(props) => <AdminGoods
                                                                        _searchCategoryName={_searchCategoryName}
                                                                        price_comma={price_comma}
                                                                        _filterURL={_filterURL}
                                                                        _searchStringColor={_searchStringColor}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route  path='/admin/goods/goods_write'
                                                            render={(props) => <AdminGoodsWrite
                                                                        _pageMove={_pageMove}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route  path='/admin/goods/goods_write/?modify_id'
                                                            render={(props) => <AdminGoodsWrite
                                                                        _pageMove={_pageMove}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route path='/admin/goods'
                                                            render={(props) => <AdminGoods
                                                                        _searchCategoryName={_searchCategoryName}
                                                                        price_comma={price_comma}
                                                                        _filterURL={_filterURL}
                                                                        _searchStringColor={_searchStringColor}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route path='/admin/goods/?search'
                                                            render={(props) => <AdminGoods
                                                                        _searchCategoryName={_searchCategoryName}
                                                                        price_comma={price_comma}
                                                                        _filterURL={_filterURL}
                                                                        _searchStringColor={_searchStringColor}
                                                                        {...props} 
                                                            />}
                                                        />

{/* 
                                                        <Route path='/admin/goods'
                                                            render={(props) => <AdminGoods
                                                                        _pageMove={_pageMove}
                                                                        {...props} 
                                                            />}
                                                        /> */}

                                                        <Route path='/admin/order'
                                                            render={(props) => <AdminOrder
                                                                        price_comma={price_comma}
                                                                        _filterURL={_filterURL}
                                                                        _searchStringColor={_searchStringColor}
                                                                        _setModalStyle={_setModalStyle}
                                                                        _setGoodsStock={_setGoodsStock}
                                                                        _setPoint={_setPoint}
                                                                        _sendMailer={_sendMailer}
                                                                        _addAlert={_addAlert}
                                                                        {...props} 
                                                            />}
                                                        />


                                                        <Route  path='/admin/user'
                                                            render={(props) => <AdminUser
                                                                        user_info={user_info}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route  path='/admin/user/?search'
                                                            render={(props) => <AdminUser
                                                                        user_info={user_info}
                                                                        {...props} 
                                                            />}
                                                        />
                                                    </Switch>
                                                </div>
                                            </div>

                                            
                                        </div>
            
                : null

                : <div id='admin_loading_div' className='aCenter recipe_korea'>
                    <h2> 로딩중입니다. </h2>
                  </div>
                }
            </div>
        )
    }
}

AdminHome.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_state : state.admin.admin_state,
        admin_loading : state.admin.admin_loading,
        list_modal : state.admin.list_modal,
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminHome);