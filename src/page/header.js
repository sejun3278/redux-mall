import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import '../css/main.css';
import * as configAction from '../Store/modules/config';
import * as searchAction from '../Store/modules/search';
import * as signupAction from '../Store/modules/signup';

import { Link } from 'react-router-dom';
import img from '../source/img/icon.json';

// import $ from 'jquery';
import URL from '../config/url';

class Header extends Component {
    async componentDidMount() {
        this._urlCheck();
        // this._setScrollSize();
        // window.addEventListener("scroll", this._setScrollSize);
        
        // let user = sessionStorage.getItem('login');
        // if(user) {
        //     user = JSON.parse(user);
        //     // 관리자 확인하기
        // }

        // alert 메세지 조회하기
        await this._getAlertMessage();
    }

    _getAlertMessage = async () => {
        const { user_info, _getCookie } = this.props;
        const user_cookie = await _getCookie('login', 'get');

        if(user_info.id && user_cookie) {
            console.log(123)

            const obj = { 'type' : 'SELECT', 'table' : 'alert', 'comment' : 'alert 정보 가져오기' };

        }
    }

    _urlCheck = async () => {
        const { location, _getCookie, _hashString } = this.props;
        
        const url = location.pathname;
        if(url.includes('/signup/complate') === false) {
            await _getCookie('signup', 'remove');
        }

        if(url.includes('/myPage/order') === false) {
            await _getCookie('order', 'remove');
        }

        if(url.includes('/myPage/orderComplate') === false) {
            await _getCookie('order_complate', 'remove');
            sessionStorage.removeItem(_hashString('order_complate'));
        }

        if(url.includes('/orderCheck') === false) {
            await _getCookie('order_check', 'remove');
            sessionStorage.removeItem(_hashString('order_check'));
        }

        if(url.includes('/myPage/order_list') === false) {
            if(url.includes('/goods/') === false) {
                await _getCookie(_hashString('detail_order_id'), 'remove');
                sessionStorage.removeItem('after_move');
            }
        }

        if(url.includes('/goods') === false) {
            sessionStorage.removeItem('page_move');
        }

      }
    
    componentWillUnmount() {
        window.removeEventListener("scroll", this._setScrollSize);
    }

    _setScrollSize = () => {
        // 화면 스크롤 구하기
        // const width_size = window.scrollX;
        // const height_size = window.scrollY;

        // if(height_size > 88) {
        //     $('#header_other_div').css({ 
        //         // 'position' : 'fixed',
        //         'width' : '100%',
        //         'marginTop' : '-81px'
        //     })

        //     $('#header_other_mobile_div').css({
        //         'position' : 'fixed',
        //         'width' : '100%',
        //         'marginTop' : '-20px'
        //     })

        // } else if(height_size <= 23) {
        //     $('#header_other_div, #header_other_mobile_div').css({ 
        //         'position' : 'relative',
        //         'marginTop' : '0px',
        //         'width' : 'auto',
        //     })
        // }
    }  

    _logout = async () => {
        const { _getCookie } = this.props;

        if(window.confirm('로그아웃 하시겠습니까?')) {
            // sessionStorage.removeItem('login');
            await _getCookie('login', 'remove');

            const url = ['/myPage', '/admin'];
            let url_check = false;
            url.forEach( (el) => {
                if(window.location.pathname.includes(el)) {
                    url_check = true;
                }
            })

            // admin Session 삭제
            // sessionStorage.removeItem('admin');
            await _getCookie('admin', 'remove');

            if(url_check) {
                return window.location.replace('/')
            }
            return window.location.reload();
        }
        return;
    }

    _closeCategory = () => {
        const { configAction, select_cat_open } = this.props;

        if(select_cat_open) {
            configAction.select_cat_data({ 'bool' : false, 'type' : null })
        }
    }

    // _loginCheckAndMove = async (type) => {
    //     const { user_info, _getCookie, _modalToggle, signupAction, _hashString } = this.props;
    //     const login_cookie = await _getCookie('login', 'get');

    //     if(!user_info || !login_cookie) {
    //         alert('로그인이 필요합니다.');

    //         const after_url = '/myPage/' + type;
    //         signupAction.set_login_after({ 'url' : after_url })

    //         return _modalToggle(true);
    //     }

    //     if(type === 'order_list') {
    //         await _getCookie(_hashString('detail_order_id'), 'remove');
    //     }

    //     return window.location.href = '/myPage/' + type;
    // }

    render() {
        const { _pageMove, _modalToggle, login, user_info, _search, search, _loginAfter } = this.props;
        const { _closeCategory } = this;

        return (
            <div id='main_header'>
                <div id='main_header_div' onMouseEnter={_closeCategory}>
                    <div id='main_header_center'> 
                        { /* Center */ }

                        <div>
                            <h4 id='main_title'>
                                <b onClick={() => _pageMove('href', '/')} className='pointer'> Sejun's Mall </b> 
                            </h4>

                            {user_info && user_info.admin === 'Y' ? 
                                <div> 
                                    <img src={img.icon.admin}
                                        id='admin_icon'
                                        title='관리자 페이지'
                                        className='pointer'
                                        alt=''
                                        onClick={() => (window.location.href='/admin')}
                                    />
                                </div>
                            : null}
                        </div>
                    </div>

                    <div className='aRight'>
                        <div className='inline_block font_13' id='main_header_right_contents'>
                            { /* Right */ }
                            {!login 
                                ?
                                <div className='aRight'>
                                    <div className='inline_block'>
                                        <u className='remove_underLine pointer'
                                            onClick={() => _modalToggle(true)}
                                        > 
                                            로그인 
                                        </u>
                                    </div>

                                    <div className='inline_block'> 
                                        <Link to='/signup'> 회원가입 </Link> 
                                    </div>
                                </div>
                                
                                :

                                <div className='aRight'>
                                    <div className='inline_block'>
                                        <u className='remove_underLine pointer'
                                            onClick={() => this._logout()}>
                                            로그아웃 
                                        </u>
                                    </div>

                                    <div className='inline_block'> 
                                        <Link to='/myPage'> 마이 페이지 </Link> 
                                    </div>
                                </div>
                                }
                        </div>
                    </div>
                </div>

                <div id='header_other_div' className='white'>
                    <div id='header_category_div'> 
                        <img src={img.icon.category} className='pointer' alt='' />
                        <b className='pointer'> 카테고리 </b>
                    </div>
                    <div id='header_search_div'> 
                        <form onSubmit={_search}>
                            <input type='text' maxLength='20' name='search' defaultValue={search} />
                            <input type='image' name='submit' alt='' src={img.icon.search} id='header_search_icon' title='검색하기' className='pointer'/>
                        </form>
                    </div>
                    <div id='header_myPage_div'>
                        <div> 
                            <u className='pointer remove_underLine' onClick={() => _loginAfter('/myPage/cart')}> 장바구니 </u>
                        </div>
                        <div> 
                            <u className='pointer remove_underLine' onClick={() => _loginAfter('/myPage/order_list')}> 주문 / 배송 현황 </u>
                        </div>
                        <div> 
                            <u className='pointer remove_underLine' onClick={() => _loginAfter('/myPage/like_list')}> 찜 리스트 </u>
                        </div>
                    </div>
                </div>
                            
                <div id='header_other_mobile_div'>
                    <div> </div>
                    <div onClick={() => _loginAfter('/myPage/cart')}> 장바구니 </div>
                    <div onClick={() => _loginAfter('/myPage/order_list')}> 주문 / 배송 현황</div>
                    <div onClick={() => _loginAfter('/myPage/like_list')}> 찜 리스트 </div>
                    <div> </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        login : state.config.login,
        window_width : state.config.window_width,
        window_height : state.config.window_height,
        admin_state : state.admin.admin_state,
        search : state.search.search,
        select_cat_open : state.config.select_cat_open
    }), 
  
    (dispatch) => ({
        configAction : bindActionCreators(configAction, dispatch),
        searchAction : bindActionCreators(searchAction, dispatch),
        signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Header);