import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import { Route, Switch } from 'react-router-dom';
import { PassAdmin } from './index';

// import URL from '../../../config/url';
// import $ from 'jquery';

class AdminHome extends Component {
    componentDidMount() {
        const { login, user_info, _checkAdmin,_checkLogin, adminAction } = this.props;
        _checkLogin();

        const get_admin_check = async () => {
            const admin_check = await this._getAdminCheck();

            adminAction.login_admin({ 'bool' : admin_check })
        }
        get_admin_check();

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
            }
        }
    }

    _getAdminCheck = async () => {
        // 관리자 인증 확인하기
        const all_cookies = await this.props._getAllCookies();

        if(all_cookies.admin) {
            return true;
        }
        return false;
    }

    render() {
        const { 
            admin_info, user_info, _checkAdmin, login, _checkLogin, _getAllCookies, admin_state 
        } = this.props; 

        return(
            <div id='admin_page_div'>
                {!admin_info && admin_state === null
                    ? <div className='aCenter my_page_title'> 관리자 체크 중 </div>
                
                    : admin_state === false
                    ?   <div>
                            <Switch>
                                <Route path='/admin/pass_admin'
                                    render={(props) => <PassAdmin
                                        user_info={user_info}
                                        _checkAdmin={_checkAdmin}
                                        _checkLogin={_checkLogin}
                                        login={login}
                                        admin_info={admin_info}
                                        _getAllCookies={_getAllCookies}
                                        {...props} 
                                    />}
                            />
                            </Switch>
                      </div>

                    : <div> 인증 완료 </div>
                }

            </div>
        )
    }
}

AdminHome.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_state : state.admin.admin_state
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminHome);