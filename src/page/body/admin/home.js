import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import { Route, Switch } from 'react-router-dom';
import { 
    PassAdmin, AdminGoodsWrite, AdminCategory, AdminGoods, AdminOrder, AdminUser
} from './index';

import img from '../../../source/img/icon.json'

import Modal from 'react-modal';
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
    componentDidMount() {
        const { login, user_info, _checkAdmin, _checkLogin, adminAction } = this.props;
        _checkLogin();

        if(!user_info || !login) {
            return window.location.replace('/');

        } else {
            if(user_info) {
                const check_admin_fn = async () => {
                    const check_admin = await _checkAdmin(user_info);

                    if(check_admin === false) {
                        alert('관리자 권한이 없습니다.');
                         return window.location.replace('/');
                    }
                }
                check_admin_fn();

                if(sessionStorage.getItem('admin')) {
                    adminAction.login_admin({ 'bool' : true })

                } else {
                    // adminAction.login_admin({ 'bool' : false })
                }
            }
        }
    }

    _getAdminCheck = async () => {
        // 관리자 인증 확인하기
        // const all_cookies = await this.props._getAllCookies();
        const admin_session = sessionStorage.getItem('admin');

        if(admin_session) {
            return true;
        }
        return false;
    }

    // 목록 Modal Toggle
    _listModalToggle = (bool) => {
        const { adminAction } = this.props;
        
        adminAction.list_modal_toggle({ 'bool' : bool })
    }

    render() {
        const { 
            admin_info, user_info, _checkAdmin, login, _checkLogin, admin_state, _pageMove,
            list_modal, cat_name, _searchCategoryName, price_comma
        } = this.props;
        
        return(
            <div id='admin_page_div'>
                {user_info && admin_info
                
                ? admin_state === null ? 
                                        <div>
                                            <PassAdmin 
                                                user_info={user_info}
                                                _checkAdmin={_checkAdmin}
                                                _checkLogin={_checkLogin}
                                                login={login}
                                                admin_info={admin_info}
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
                                                             onClick={() => this._listModalToggle(false)}
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
                                                                        _pageMove={_pageMove}
                                                                        _searchCategoryName={_searchCategoryName}
                                                                        price_comma={price_comma}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route  path='/admin/goods/goods_write/?modify_id'
                                                                path='/admin/goods/goods_write'
                                                            render={(props) => <AdminGoodsWrite
                                                                        _pageMove={_pageMove}
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route path='/admin/goods/?search'
                                                               path='/admin/goods'
                                                            render={(props) => <AdminGoods
                                                                        _pageMove={_pageMove}
                                                                        _searchCategoryName={_searchCategoryName}
                                                                        price_comma={price_comma}
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
                                                                        {...props} 
                                                            />}
                                                        />

                                                        <Route  path='/admin/user/?search'
                                                                path='/admin/user'
                                                            render={(props) => <AdminUser
                                                                        user_info={user_info}
                                                                        {...props} 
                                                            />}
                                                        />
                                                    </Switch>
                                                </div>
                                            </div>

                                            
                                        </div>
            
                : null}
            </div>
        )
    }
}

AdminHome.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_state : state.admin.admin_state,
        list_modal : state.admin.list_modal,
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminHome);