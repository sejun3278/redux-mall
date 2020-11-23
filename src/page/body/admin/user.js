import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import * as adminUserAction from '../../../Store/modules/admin_user';

import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';
import img from '../../../source/img/icon.json';

class AdminUser extends Component {

    componentDidMount() {
        this._getUserData();
    }

    // 유저 데이터 / 갯수 가져오기
    _getUserData = async (filter, filter_target) => {
        const { adminUserAction, location } = this.props;
        const qry = queryString.parse(location.search);

        const search_opt = qry.search_opt
        const search = qry.search;

        const obj = {};

        obj['query'] = {};
        obj['query']['count'] = 'SELECT COUNT(*) AS `count` FROM `userInfo`';
        obj['query']['select'] = 'SELECT * FROM `userInfo`';

        let query_str = '';
        let filter_str = '';

        if(!filter) {
            filter = '';
        }

        if(search_opt) {
            query_str = ' WHERE ' + search_opt + ' LIKE ' + '"%' + search + '%"';

            obj['query']['count'] += query_str;
            obj['query']['select'] += query_str;

            if(filter && filter_target) {
                filter_str = ' AND ';

                filter_str += filter_target + ' IS NOT NULL';
            }

        } else {
            if(filter && filter_target) {
                filter_str = ' WHERE ';

                filter_str += filter_target + ' IS NOT NULL';
            }
        }

        obj['query']['count'] += filter_str + filter;
        obj['query']['select'] += filter_str + filter;

        // if(filter) {
            // let where_qry = '';

        //     if(!search_opt) {
        //         where_qry = ' WHERE '; 
        //     }

        //     where_qry = search_opt + ' IS NOT NULL';
            

        // }

        obj[search_opt] = search;

        const get_user_data = await axios(URL + '/get/user_data', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
        
        return adminUserAction.set_user_data({ 'obj' : get_user_data.data })
    }

    _changeFilterType = (type) => {
        const type_opt = $('select[name=admin_user_' + type + '_select]').val();

        if($('#admin_user_' + type + '_button').hasClass('user_info_selected')) {
            return this._clickFilter(type, true);
        }
    }

    _search = (event) => {
        event.preventDefault();
        
        const option = $('select[name=search_option]').val();
        const str = $('input[name=user_search]').val().trim();

        if((str.length === 0 && !str) || str === '-' ) {
            alert('검색어를 입력해주세요.');

            return $('input[name=user_search]').focus();

        } else if(option === 'phone') {
            // 옵션이 전화번호 일 때 체크
            if(!str.includes('-')) {
                alert('전화번호는 반드시 - 를 포함해 입력해주세요.');

                return $('input[name=user_search]').focus();
            }

        } else if(option === 'email') {
            // 옵션이 이메일 일 때
            const email_host_check = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

            if(!email_host_check.test(str)) {
                alert('이메일 형식에 올바르게 입력해주세요.');

                return $('input[name=user_search]').focus();
            }
        }

        let url = '/admin/user/?search_opt=' + option + '&search=' + str;

        return window.location.href = url;
    }

    // 검색 옵션 변경
    _changeSearchOpt = () => {
        const opt = $('select[name=search_option]').val();

        $('input[name=user_search]').attr({ 'placeHolder' : '' })

        if(opt === 'phone') {
            $('input[name=user_search]').val('');
            $('input[name=user_search]').attr({ 'placeHolder' : '- 를 포함해주세요.' });

        } else if(opt === 'email') {
            $('input[name=user_search]').val('');
            $('input[name=user_search]').attr({ 'placeHolder' : '@ 를 포함해주세요.' });
        }
    }

    // 필터 선택
    _clickFilter = (type, change) => {
        const type_opt = $('select[name=admin_user_' + type + '_select]').val();
        const $el_target = $('#admin_user_' + type + '_button');

        if($el_target.hasClass('user_info_selected') && !change) {
            $('.admin_user_filter_buttons').removeClass('user_info_selected');
         
            return this._getUserData();
        }

        $('.admin_user_filter_buttons').removeClass('user_info_selected');

        const qry_str = " ORDER BY " + type + " " + type_opt; 
        $el_target.addClass('user_info_selected');

        return this._getUserData(qry_str, type);
    }

    render() {
        const { user_data, user_cnt, user_loading, location } = this.props;
        const { _search, _changeSearchOpt, _clickFilter, _changeFilterType } = this;

        const cover_user_data = JSON.parse(user_data);
        const qry = queryString.parse(location.search);
        
        const cover_search_option = qry.search_opt ? qry.search_opt : 'user_id';
        const cover_search_str = qry.search ? qry.search : '';

        return(
            <div id='admin_user_state_div'>
                {/* 유저 관리 페이지 */}

                {user_loading ? 
                <div>
                    <form name='admin_user_info_search' onSubmit={_search}>
                    <div id='admin_user_search_div' className='border_bottom font_15'>
                        <div id='admin_user_search_divs'> 
                            * 검색 옵션 
                            <select className='padding_3' name='search_option' defaultValue={cover_search_option}
                                    onChange={_changeSearchOpt}
                            > 
                                <option value='user_id'> 아이디 </option>
                                <option value='nickname'> 닉네임 </option>
                                <option value='id'> 유저 번호 </option>
                                <option value='email'> 이메일 </option>
                                <option value='phone'> 전화 번호 </option>
                                <option value='name'> 이름 </option>
                            </select>
                            　:　
                        
                            <input tpye='input' maxLength='25' name='user_search' className='padding_3 aCenter' defaultValue={cover_search_str} />
                            <img id='admin_user_search_button' alt='' src={img.icon.search_black} 
                                className='border padding_3 pointer' onClick={_search}
                            />
                        </div>
                        <div> </div>
                    </div>

                    <div id='admin_user_other_div' className='font_14 aCenter'>
                        <div id='admin_search_user_cnt_result_div' className='border_right'> 검색된 유저 수 : <b> { user_cnt } </b> </div>
                        <div className='border_right gray'> 탈퇴한 유저 수 : <b> 0 </b> </div>
                        <div className='red'> 정지된 유저 수 : <b> 0 </b> </div>

                    </div>

                {cover_user_data && user_cnt > 0 
                    ? <div>

                    <div id='admin_user_select_and_filter_div'>
                        <div> 
                            <input type='checkbox' id='admin_user_all_select' className='pointer'/>
                            <label htmlFor='admin_user_all_select' className='pointer'> 전체 선택 </label> 
                        </div>

                        <div id='admin_user_filter_div' className='aRight font_13'>   
                            <div> 
                                <select name='admin_user_signup_date_select' className='padding_3' onChange={() => _changeFilterType('signup_date')}>
                                    <option value='DESC'> 최근 </option>
                                    <option value='ASC'> 과거 </option>
                                </select>
                                <u className='admin_user_filter_buttons pointer remove_underLine marginLeft_5' id='admin_user_signup_date_button' onClick={() => _clickFilter('signup_date')}> 가입순 </u> 
                            </div>

                            <div> 
                                <select name='admin_user_login_date_select' className='padding_3' onChange={() => _changeFilterType('login_date')}>
                                    <option value='DESC'> 최근 </option>
                                    <option value='ASC'> 과거 </option>
                                </select>
                                <u className='admin_user_filter_buttons pointer remove_underLine marginLeft_5' id='admin_user_login_date_button' onClick={() => _clickFilter('login_date')}> 접속순 </u> 
                            </div>
                        </div>
                    </div>


                    <div id='admin_user_info_list_div'>
                        <div id='admin_user_info_list_tool' className='border'>
                            <div id='admin_user_info_other_bar' className='bold font_14'>
                                <div className='aCenter'> 아이디 / 닉네임 </div>
                                <div className='aCenter'> 이름 </div>
                                <div className='aCenter'> 이메일 </div>
                                <div className='aCenter'> 전화번호 </div>
                                <div className='aCenter border_none_right'> 주소 </div>
                            </div>

                            <div id='admin_user_info_contents_div'>
                                {cover_user_data.map( (el, key) => {
                                    const check_label = 'admin_user_info_user_id_' + key;

                                    const email_check = el.email;
                                    let email_id = '';
                                    let email_host = '';

                                    if(email_check.length > 3) {
                                        email_id = el.email.split('@')[0];
                                        email_host = el.email.split('@')[1];
                                    }

                                    return(
                                        <div className='admin_user_info_contents_divs' key={key}>
                                            <div className='admin_user_info_checkbox_div'>
                                                <label htmlFor={check_label} className='pointer font_12'> 유저 번호 : { el.id } </label>
                                                <input type='checkbox' id={check_label} className='pointer' />
                                            </div>

                                            <div className='admin_user_info_contents_grid_div aCenter'>
                                                <div className='admin_goods_table font_15' style={{ 'lineHeight' : '0.5' }}> 
                                                    <div className='admin_goods_table_cell'>
                                                        <b> {el.user_id} </b>
                                                        <p> ( {el.nickname} ) </p>
                                                    </div>
                                                </div>

                                                <div className='admin_goods_table font_14'>
                                                    <div className='admin_goods_table_cell'>
                                                        {el.name}
                                                    </div>
                                                </div>

                                                <div className='admin_goods_table font_14' style={{ 'lineHeight' : '0.5' }}>
                                                    {email_id && email_host
                                                        ? <div className='admin_goods_table_cell'> 
                                                            {email_id}
                                                            <p> @ {email_host} </p> 
                                                          </div>

                                                        : null
                                                    }
                                                </div>

                                                <div className='admin_goods_table font_14'> 
                                                    <div className='admin_goods_table_cell'>
                                                        {el.phone} 
                                                    </div>
                                                </div>

                                                <div className='font_14'>
                                                    {el.host_code !== '-' ?  <div> [ {el.host_code} ] </div> : null}
                                                    {el.host !== '-' ?  <div> { el.host } </div> : null}
                                                    {el.host_detail !== '-' ?  <div> {el.host_detail} </div> : null}
                                                </div>
                                            </div>

                                            {/* 반응형 div */}
                                            <div className='admin_user_responsive_contents_div display_none'>
                                                <ul className='list_none'>
                                                    <li> 아이디 : <b> {el.user_id} </b> </li>
                                                    <li> 닉네임 : {el.nickname} </li>
                                                    <li> 이　름 : {el.name} </li>
                                                    <li> 이메일 : {el.email} </li>
                                                    <li> 번　호 : {el.phone} </li>
                                                    <li> 
                                                        주　소 : 
                                                        <div className='admin_user_responsive_host_li'> 
                                                            {el.host_code ? "[" + el.host_code + "]" : null}
                                                            <span> {el.host !== '-' ?  <p> { el.host } </p> : null} </span>
                                                            <span> {el.host_detail !== '-' ?  <p> { el.host_detail } </p> : null} </span>
                                                        </div>
                                                    </li>

                                                </ul>
                                            </div>

                                            <div className='admin_user_info_other_date_div border_top'>
                                                <div> 가입일 : {el.signup_date} </div>
                                                <div> 최근 접속 : {el.login_date} </div>
                                                <div></div>
                                            </div>
                                        </div>
                                    )
                                }) }
                            </div>
                        </div>
                    </div>
                </div>

                : <div className='aCenter red marginTop_40'> 
                    <h4> 조회되는 데이터가 없습니다. </h4>
                
                </div> }


                    </form>
                </div>

                : <div className='aCenter bold marginTop_30'> <h4> 데이터를 조회하고 있습니다. </h4> </div> }
            </div>
        )
    }
}

AdminUser.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        user_data : state.admin_user.user_data,
        user_cnt : state.admin_user.user_cnt,
        user_loading : state.admin_user.user_loading
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch),
        adminUserAction : bindActionCreators(adminUserAction, dispatch)
    })
  )(AdminUser);