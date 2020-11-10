import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../../Store/modules/signup';
// import * as configAction from '../../../Store/modules/config';

import img from '../../../source/img/icon.json';

import '../../../css/responsive/signup.css';
import $ from 'jquery';

class My_page_home extends Component {

    componentDidMount() {
        // 로그인 체크
        const { user_info, login } = this.props;

        if(!user_info || !login) {
            return window.location.replace('/');
        }
    }

    _iconToggle = (target, type) => {
        const target_el = '#my_page_' + target + '_div div u';
        const target_img_div = '#my_page_' + target + '_div div div';
        let img_el = '';

        if(type === 'mouseOver') {
            $(target_el).css({ 'color' : 'black', 'fontWeight' : 'bold', 'borderBottom' : 'solid 2px black' })

            img_el = target + '_black';

        } else if(type === 'mouseLeave') {
            $(target_el).css({ 'color' : '#ababab', 'fontWeight' : '400', 'borderBottom' : 'solid 1px #ababab' })

            img_el = target + '_gray';

        } else if(type === 'move') {
            const url = '/myPage/' + target;

            return window.location.href = url;
        }

        $(target_img_div).css({ 'backgroundImage' : `url(${img.icon[img_el]})` })
    }

    render() {
        const { _iconToggle } = this; 

        const user_info = JSON.parse(sessionStorage.getItem('login'));

        if(!user_info) {
            return window.location.replace('/');
        }

        const signup_date = user_info.signup_date.slice(0, 10);


        return(
            <div id='my_page_div'>
                <div id='my_page_title_div' className='my_page_title border_bottom'>
                    <h3 className='aCenter'> 마이 페이지 </h3>
                </div>

                <div id='my_page_profile_div' className='border_bottom'>
                    <div> </div>
                    <div id='user_thumbnail_div'> 
                        <img id='user_thumbnail_img' alt=''
                            style={{ 'backgroundImage' : `url(${img.icon.user_icon})` }}
                        />
                        <div id='user_mobile_id_div'> 
                            <p> <b> {user_info.user_id} </b> </p>
                            <p> ( {user_info.nickname} )</p>
                        </div>
                    </div>

                    <div>
                        <div className='my_page_info_title_div'> 
                            <div id='my_page_user_id'> 
                                아이디
                                <p> {user_info.user_id} </p>
                            </div>

                            <div> 
                                포인트 
                                <p> 0 P </p>    
                            </div>

                            <div> 
                                가입일
                                <p> {signup_date} </p> 
                            </div>
                        </div>

                        <div className='my_page_info_title_div'
                            style={{ 'marginTop' : '15px' }}
                        > 
                            <div id='my_page_user_nick'> 
                                닉네임 
                                <p> {user_info.nickname} </p>
                            </div>

                            <div> 
                                보유 쿠폰 
                                <p> 0 개 </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id='my_page_select_div'>
                    <div> </div>
                    <div>
                        <div className='my_page_select_grid_div'>
                            <div id='my_page_modify_user_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('modify_user', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('modify_user', 'mouseLeave')}
                                 onClick={() => _iconToggle('modify_user', 'move')}
                            >
                                <div> 
                                    <u> 회원 정보 수정 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.modify_user_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>

                            <div id='my_page_cart_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('cart', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('cart', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 장바구니 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.cart_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>

                            <div id='my_page_order_list_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('order_list', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('order_list', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 주문 / 배송 현황 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.order_list_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className='my_page_select_grid_div'>
                            <div id='my_page_like_list_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('like_list', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('like_list', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 찜 리스트 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.like_list_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>

                            <div className='my_page_select_divs' />

                            <div id='my_page_QandA_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('QandA', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('QandA', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 문의 / 답변 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.QandA_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className='my_page_select_grid_div'>
                            <div id='my_page_star_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('star', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('star', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 내 평점 내역 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.star_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>

                            <div id='my_page_se_bot_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('se_bot', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('se_bot', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 세봇 (Sejun-Bot) </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.se_bot_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>

                            <div id='my_page_coupon_div'
                                 className='my_page_select_divs'
                                 onMouseEnter={() => _iconToggle('coupon', 'mouseOver')}
                                 onMouseLeave={() => _iconToggle('coupon', 'mouseLeave')}
                            >
                                <div> 
                                    <u> 내 쿠폰함 </u> 
                                    <div className='my_page_icon_img'
                                         style={{ 'backgroundImage' : `url(${img.icon.coupon_gray})` }}
                                    >
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div> </div>
                </div>
            </div>
        )
    }
}

My_page_home.defaultProps = {
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
      signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(My_page_home);