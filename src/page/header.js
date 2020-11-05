import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import '../css/main.css';
import * as configAction from '../Store/modules/config';

import { Link } from 'react-router-dom';

import img from '../source/img/icon.json';

class Header extends Component {

    _logout = () => {
        if(window.confirm('로그아웃 하시겠습니까?')) {
            sessionStorage.removeItem('login');

            const url = ['/myPage'];
            let url_check = false;
            url.forEach( (el) => {
                if(window.location.pathname.includes(el)) {
                    url_check = true;
                }
            })

            if(url_check) {
                return window.location.replace('/')
            }
            return window.location.reload();
        }
        return;
    }

    render() {
        const { _pageMove, _modalToggle, login } = this.props;

        return (
            <div id='main_header'> 
                <div id='main_header_div'>
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
                                <li> 
                                    <Link to='/myPage'> 마이 페이지 </Link> 
                                </li>
                            </div>
                            }
                        </ul>
                    </div>
                </div>

                <div id='header_other_div' className='white'>
                    <div id='header_category_div'> 
                        <img src={img.icon.category} className='pointer' />
                        <b className='pointer'> 카테고리 </b>
                    </div>
                    <div id='header_search_div'> 
                        <input type='text' maxLength='20' />
                        <img src={img.icon.search} id='header_search_icon' title='검색하기' className='pointer'/>
                    </div>
                    <div id='header_myPage_div'>
                        <div> 장바구니 </div>
                        <div> 주문 / 배송 현황 </div>
                        <div> 찜 리스트 </div>
                    </div>
                </div>
                            
                <div id='header_other_mobile_div'>
                    <div> </div>
                    <div> 장바구니 </div>
                    <div> 주문 / 배송 현황</div>
                    <div> 찜 리스트 </div>
                    <div> </div>
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