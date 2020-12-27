import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../../Store/modules/signup';
import * as configAction from '../../../Store/modules/config';

import my_page_icon from '../../../source/img/icon.json';
import page_list from '../../../source/myPage.json';

import '../../../css/responsive/signup.css';
import $ from 'jquery';

// import $ from 'jquery';

class MyPage extends Component {

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

        $(target_img_div).css({ 'backgroundImage' : `url(${my_page_icon.my_page[img_el]})` })
    }

    render() {
        const { user_info } = this.props;
        const { _iconToggle } = this;

        let signup_date;
        if(user_info) { 
            signup_date = user_info.signup_date.slice(0, 10);
        }

        return(
            <div>
                <div id='my_page_profile_div' className='border_bottom'>
                    <div> </div>
                    <div id='user_thumbnail_div'> 
                        <img id='user_thumbnail_img' alt=''
                            style={{ 'backgroundImage' : `url(${my_page_icon.my_page.user_icon})` }}
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
                                <p className='bold'> {user_info.user_id} </p>
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
                            {page_list.myPage.arr.map( (el, key) => {
                                const _el = el[0];
                                const icon_img = my_page_icon.my_page[_el.path + '_gray'];

                                return(
                                    <div key={key} id={_el.path !== null ? 'my_page_' + _el.path + '_div' : null}
                                         className='my_page_select_divs'
                                         onMouseEnter={_el.path !== null ? () => _iconToggle(_el.path, 'mouseOver') : null}
                                         onMouseLeave={_el.path !== null ? () => _iconToggle(_el.path, 'mouseLeave') : null}
                                         onClick={_el.path !== null ? () => _iconToggle(_el.path, 'move') : null}
                                    >
                                        {_el.path !== null 
                                        ?
                                            <div> 
                                                <u> { page_list.myPage.page_name[_el.path] } </u> 
                                                <div className='my_page_icon_img'
                                                    style={{ 'backgroundImage' : `url(${icon_img})` }}
                                                >
                                                </div>
                                            </div>
                                        : null}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div> </div>
                </div>
            </div>
        )
    }
}

MyPage.defaultProps = {
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
        signupAction : bindActionCreators(signupAction, dispatch),
        configAction : bindActionCreators(configAction, dispatch)
      })
  )(MyPage);