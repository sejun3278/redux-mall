import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import '../css/main.css';
import * as configAction from '../Store/modules/config';

import { Link } from 'react-router-dom';

class Header extends Component {

    _logout = () => {
        if(window.confirm('로그아웃 하시겠습니까?')) {
            sessionStorage.removeItem('login');
            
            return window.location.reload();
        }
        return;
    }

    render() {
        const { _pageMove, _modalToggle, login } = this.props;
        console.log(login)

        return (
            <div id='main_header'> 
                <div id='main_header_left'> </div>
                <div id='main_header_center'> 
                    { /* Center */ }
                    <h4 id='main_title'> <b onClick={() => _pageMove('href', '/')} className='pointer'> Sejun's Mall </b> </h4>
                </div>

                <div id='main_header_right'> 
                    { /* Right */ }
                    <ul id='main_login_ul'>
                        {!login 
                        ? 
                        <div>
                            <li> 
                                <u className='remove_underLine pointer'
                                onClick={() => _modalToggle(true)}
                                > 
                                    로그인 
                                </u> 
                            </li>
                            <li> 
                                <Link to='/signup'> 회원가입 </Link> 
                            </li>
                        </div>
                        
                        :
                        <div>
                            <li>
                                <u className='remove_underLine pointer'
                                onClick={() => this._logout()}
                                > 
                                    로그아웃 
                                </u> 
                            </li>
                        </div>
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        login : state.config.login
    }), 
  
    (dispatch) => ({
        configAction : bindActionCreators(configAction, dispatch)
    })
  )(Header);