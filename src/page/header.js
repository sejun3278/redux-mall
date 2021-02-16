import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import Modal from 'react-modal';

import '../css/main.css';
import * as configAction from '../Store/modules/config';
import * as searchAction from '../Store/modules/search';
import * as signupAction from '../Store/modules/signup';

import icon from '../source/img/icon.json';

// import $ from 'jquery';
import URL from '../config/url';

const customStyles = {
    content : {
      top                   : '300px',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      width                 : '450px',
    }
  };
  
  Modal.setAppElement('body')

class Header extends Component {
    async componentDidMount() {
        this._urlCheck();
    }

    _urlCheck = async () => {
        const { location, _getCookie, _hashString } = this.props;
        
        const url = location.pathname;
        if(url.includes('/signup/complate') === false) {
            await _getCookie('signup', 'remove', null, true);
        }

        if(url.includes('/myPage/order') === false) {
            await _getCookie('order', 'remove', null, true);
        }

        if(url.includes('/myPage/orderComplate') === false) {
            await _getCookie('order_complate', 'remove', null, true);
            // sessionStorage.removeItem(_hashString('order_complate'));
        }

        if(url.includes('/orderCheck') === false) {
            await _getCookie('order_check', 'remove', null, true);
            // sessionStorage.removeItem(_hashString('order_check'));
        }

        if(url.includes('/myPage/order_list') === false) {
            if(url.includes('/goods/') === false) {
                await _getCookie(_hashString('detail_order_id'), 'remove', null, true);
            }
        }

        if(url.includes('/goods') === false) {
            await _getCookie(_hashString('page_move'), 'remove', null, true);
        }

      }
    
    componentWillUnmount() {
        // window.removeEventListener("scroll", this._setScrollSize);
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

    _clickAlert = async (info) => {
        const update_obj = { 'type' : 'UPDATE', 'table' : 'alert', 'comment' : '쪽지 확인 완료' };

        update_obj['columns'] = [];
        update_obj['columns'][0] = { 'key' : 'confirm', 'value' : 1 };
        
        update_obj['where'] = [];
        update_obj['where'].push({ 'key' : 'id', 'value' : info.id });

        update_obj['where_limit'] = 0;
        
        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_obj
        });

        return window.location.href = info.move_url
    }

    _openAlert = () => {
        // 쪽지창 열기
        const { configAction } = this.props;

        configAction.save_user_alert_info({ 'bool' : true })
        configAction.select_cat_data({ 'bool' : false });
    }

    _clickCategory = () => {
        const { configAction, select_cat_open } = this.props;

        configAction.select_cat_data({ 'bool' : !select_cat_open });
    }

    render() {
        const { 
            _pageMove, _modalToggle, login, user_info, _search, search, _loginAfter, alert_modal, configAction,
            user_alert_length, user_alert_noShow, alert_loading, select_cat_open
        } = this.props;
        const { _closeCategory, _clickAlert, _clickCategory, _openAlert } = this;
        const user_alert_info = JSON.parse(this.props.user_alert_info);

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
                                    <img src={icon.icon.admin}
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
                                <div className='aRight login_header_div'>
                                    <div className='inline_block'>
                                        <u className='remove_underLine pointer'
                                            onClick={() => _modalToggle(true)}
                                        > 
                                            로그인 
                                        </u>
                                    </div>

                                    <div className='inline_block'> 
                                        <u className='remove_underLine pointer'
                                            onClick={() => window.location.href='/signup'}>  
                                            회원가입
                                        </u>
                                    </div>
                                </div>
                                
                                :

                                <div className='aRight login_header_div'>
                                    <div className='inline_block'>
                                        <u className='remove_underLine pointer'
                                            onClick={() => this._logout()}>
                                            로그아웃 
                                        </u>
                                    </div>

                                    <div className='inline_block'> 
                                        <u className='remove_underLine pointer'
                                            onClick={() => window.location.href='/myPage'}>  
                                            마이 페이지
                                        </u>
                                    </div>
                                </div>
                                }
                        </div>
                    </div>    
                </div>

                {user_info.id 
                    ?
                    <div id='header_login_info_div' className='aRight font_12'>
                        <div className='display_inline gray'>
                            <u className='black bold'> {user_info.user_id} </u> 님, 안녕하세요!
                        </div>

                        <div className='display_inline'>
                            <img alt='' id='header_user_alert_icon' className='pointer'
                                src={user_alert_noShow === 0 ? icon.icon.alert_default : icon.icon.alert_have}
                                onClick={_openAlert}
                                title={user_alert_noShow > 0 ? user_alert_noShow + ' 개의 안 읽은 쪽지가 있습니다.' : null}
                            />
                        </div>
                    </div>

                    : null
                }

                <Modal
                    isOpen={alert_modal}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={() => configAction.save_user_alert_info({ 'bool' : false })}
                    style={customStyles}
                    // contentLabel="Example Modal"
                >
                    <div id='header_alert_div'>
                        <img alt='' src={icon.icon.close_black} id='header_alert_close_icon' className='pointer' 
                             onClick={() => configAction.save_user_alert_info({ 'bool' : false })} title='알림 쪽지창 닫기'
                        />
                        <h4 id='header_alert_title_div' className='aCenter'> 
                            <img alt='' src={icon.icon.alert_default} id='header_alert_icon' /> 알림 쪽지 
                        </h4>

                        {alert_loading === true 
                            ?
                            user_alert_length > 0
                                ?  <div>
                                        <div id='alert_length_title_div' className='grid_half'>
                                            <div id='alert_length_title'> 총 <b> {user_alert_length} </b> 개의 쪽지를 받으셨습니다. </div>
                                            <div className='aRight font_12'> 읽지 않은 쪽지　|　<b> {user_alert_noShow} </b> </div>
                                        </div>

                                        <div id='alert_contents_div'>
                                            {user_alert_info.map( (el, key) => {
                                                let style_col = {}

                                                if((key + 1) < user_alert_info.length) {
                                                    style_col['borderBottom'] = 'dotted 1px #ababab';
                                                }

                                                if(el.confirm === 0) {
                                                    style_col['backgroundColor'] = '#faf3e0'
                                                }

                                                return(
                                                    <div key={key} className='alert_contents_list_div pointer'
                                                        style={style_col} onClick={() => _clickAlert(el)}
                                                    >
                                                        <div className='font_13' dangerouslySetInnerHTML={{ __html : el.reason }} />
                                                        <div className='font_12 gray aRight'> {el.create_date.slice(0, 16)} </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                : <h4 className='aCenter'>
                                    받은 쪽지가 없습니다.
                                </h4>

                            : <h4 className='aCenter gray'>
                                데이터를 불러오고 있습니다.
                              </h4>
                        }
                    </div>
                </Modal>

                <div id='header_other_div' className='white'>
                    <div id='header_category_div'> 
                        <img src={icon.icon.category} className='pointer' alt='' 
                             onClick={() => _clickCategory()}
                        />
                        <b className='pointer' onClick={() => _clickCategory()}
                            style={select_cat_open === true ? { 'color' : '#52BFFF' } : null}
                        > 
                            카테고리 
                        </b>
                    </div>
                    <div id='header_search_div'> 
                        <form onSubmit={_search}>
                            <input type='text' maxLength='20' name='search' defaultValue={search} />
                            <input type='image' name='submit' alt='' src={icon.icon.search} id='header_search_icon' title='검색하기' className='pointer'/>
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
        select_cat_open : state.config.select_cat_open,
        user_alert_info : state.config.user_alert_info,
        user_alert_length : state.config.user_alert_length,
        user_alert_noShow : state.config.user_alert_noShow,
        alert_modal : state.config.alert_modal,
        alert_loading : state.config.alert_loading,
        select_cat_open : state.config.select_cat_open
    }), 
  
    (dispatch) => ({
        configAction : bindActionCreators(configAction, dispatch),
        searchAction : bindActionCreators(searchAction, dispatch),
        signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Header);