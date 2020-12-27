import React, { Component } from 'react';
import axios from 'axios';

import { MyPage, ModifyUser, LikeList, Cart, Order, Coupon } from './index';
import { Route, Switch } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../../Store/modules/signup';
import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

// import img from '../../../source/img/icon.json';
import page_list from '../../../source/myPage.json';

import '../../../css/responsive/signup.css';
import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';

import $ from 'jquery';
import coupon_list from '../../../source/coupon_code.json';

class MyPageHome extends Component {

    componentDidMount() {
        // 로그인 체크
        const { user_info } = this.props;

        if(!user_info) {
            alert('로그인이 필요합니다.');

            return window.location.replace('/');
        }

        this._getCouponList();
    }

    _toggleCouponListModal = (bool) => {
        const { myPageAction } = this.props;

        return myPageAction.toggle_coupon_modal({ 'bool' : bool })
    }

    // 쿠폰 조회하기
    _getCouponList = async () => {
        const { myPageAction, user_info } = this.props;

        const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 조회하기' };

        obj['option'] = {};

        obj['option']['user_id'] = '=';
        obj['option']['state'] = '=';
        obj['option']['limit_date'] = '>=';
        obj['option']['use_order_id'] = 'IS NULL';


        obj['where'] = [];
        obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.id };
        obj['where'][1] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };
        obj['where'][2] = { 'table' : 'coupon', 'key' : 'limit_date', 'value' : null };
        obj['where'][3] = { 'table' : 'coupon', 'key' : 'use_order_id', 'value' : null };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const cover_data = [];
        get_data.data[0].forEach( (el) => {
            if(coupon_list.coupon_code[el.code]) {
                if(coupon_list.coupon_code[el.code].able === true) {
                    cover_data.push(el);
                }
            }
        })

        myPageAction.save_coupon_data({ 'list' : JSON.stringify(cover_data) })
    }

    _addCoupon = async (event) => {
        event.preventDefault();
        const code = event.target.coupon_add_code.value;
        const { coupon_add_loading, myPageAction } = this.props;

        console.log(coupon_add_loading)
        if(coupon_add_loading === true) {
            return;
        }

        if(code === "" || code.length === 0) {
            $('input[name=coupon_add_code]').focus();
            return alert('추가할 쿠폰 코드 번호를 입력해주세요.');

        } else {
            const { user_info, _getCookie, admin_info } = this.props;
            const user_cookie = await _getCookie("login", "get");

            if(!user_info.id && !user_cookie) {
                alert('로그아웃 된 아이디 입니다.');
                return window.location.replace('/')
            }

            if(coupon_list.coupon_code[code] === undefined) {
                return alert('해당 코드의 쿠폰을 찾을 수 없습니다.');

            } else {
                const coupon = coupon_list.coupon_code[code];
                if(coupon.able === false) {
                    return alert('사용할 수 없는 쿠폰입니다.');
                
                } else {
                    if(coupon.admin === true) {
                        if(admin_info !== true) {
                            return alert('권한이 없습니다.');
                        }
                    }
                }

                myPageAction.toggle_coupon_add({ 'bool' : true });

                // 쿠폰 중복 체크
                const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 중복 체크' };

                obj['option'] = {};

                obj['option']['user_id'] = '=';
                obj['option']['code'] = '=';
                obj['option']['state'] = '=';

                obj['where'] = [];
                obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.id };
                obj['where'][1] = { 'table' : 'coupon', 'key' : 'code', 'value' : code };
                obj['where'][2] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };

                const query_result = await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                if(query_result.data[0][0]) {
                    // myPageAction.toggle_add_coupon({ 'bool' : false });
                    myPageAction.toggle_coupon_add({ 'bool' : false });

                    return alert('이미 추가된 쿠폰입니다.');
                }
                
                // 쿠폰 추가
                obj['type'] = 'INSERT';
                obj['comment'] = '쿠폰 추가';

                obj['columns'] = [];

                const percent = coupon.percent === true ? 1 : 0;

                obj['columns'].push({ "key" : "user_id", "value" : user_info.id })
                obj['columns'].push({ "key" : "code", "value" : code })
                obj['columns'].push({ "key" : "discount", "value" : coupon.discount })
                obj['columns'].push({ "key" : "limit_price", "value" : coupon.limit_price })
                obj['columns'].push({ "key" : "state", "value" : 0 })
                obj['columns'].push({ "key" : "create_date", "value" : null })
                obj['columns'].push({ "key" : "limit_date", "value" : coupon.limit_date })
                obj['columns'].push({ "key" : "name", "value" : coupon.name })
                obj['columns'].push({ "key" : "max_discount", "value" : coupon.max_discount })
                obj['columns'].push({ "key" : "percent", "value" : percent })

                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                myPageAction.toggle_coupon_add({ 'bool' : false });

                $('input[name=coupon_add_code]').val("");
                this._getCouponList();
                return alert('쿠폰이 등록되었습니다.');
            }
        }
    }

    _removeCoupon = () => {
        const { myPageAction , cart_coupon_price, cart_final_price} = this.props;

        const obj = {};
        obj['obj'] = JSON.stringify({});
        obj['cover'] = JSON.stringify({});

        const price_obj = {};
        price_obj['coupon_price'] = 0;
        price_obj['final_price'] = cart_final_price + cart_coupon_price;

        if(window.confirm('해당 쿠폰을 해제하시겠습니까?')) {
            myPageAction.save_cart_result_price(price_obj)
            return myPageAction.select_coupon(obj);        
        }
    }

    render() {
        const { user_info, _getCookie, price_comma, _modalToggle, admin_info, coupon_list_open_modal, _setModalStyle} = this.props;
        const coupon_list = JSON.parse(this.props.coupon_list);
        const { _toggleCouponListModal, _addCoupon, _removeCoupon } = this;

        const qry = this.props.location.pathname;
        const path = qry.split('/')[2];

        let page_name = "마이 페이지"
        let page_icon = icon.my_page.my_page
        if(path !== undefined) {
            page_name = page_list.myPage.page_name[path];
            page_icon = icon.my_page[path +  '_black']
        }

        return(
            <div id='my_page_div'>
                {user_info ? <div>
                <div id='my_page_title_div' className='my_page_title border_bottom'>
                    <img src={page_icon}/>
                    <b className='aCenter'> {page_name} </b>
                </div>
                
                <Switch>
                    {/* 마이페이지 홈 */}
                    <Route path='/myPage' exact
                        render={(props) => <MyPage
                            user_info={user_info}
                        {...props}  />}
                    />

                    {/* 유저 정보 수정 */}
                    <Route path='/myPage/modify_user'
                        render={(props) => <ModifyUser
                            user_info={user_info}
                            _getCookie={_getCookie}
                        {...props}  />}
                    />

                    {/* 찜 리스트 */}
                    <Route path='/myPage/like_list'
                        render={(props) => <LikeList
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                        {...props}  />}
                    />

                    {/* 장바구니 */}
                    <Route path='/myPage/cart'
                        render={(props) => <Cart
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                            _toggleCouponListModal={_toggleCouponListModal}
                            _addCoupon={_addCoupon}
                            _removeCoupon={_removeCoupon}
                            coupon_list_open_modal={coupon_list_open_modal}
                            _setModalStyle={_setModalStyle}
                        {...props}  />}
                    />

                    {/* 내 쿠폰 */}
                    <Route path='/myPage/coupon'
                        render={(props) => <Coupon
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                            admin_info={admin_info}
                        {...props}  />}
                    />

                    {/* 주문하기 */}
                    <Route path='/myPage/order'
                        render={(props) => <Order
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _modalToggle={_modalToggle}
                            _toggleCouponListModal={_toggleCouponListModal}
                            _addCoupon={_addCoupon}
                            _removeCoupon={_removeCoupon}
                            coupon_list_open_modal={coupon_list_open_modal}
                            _setModalStyle={_setModalStyle}
                        {...props}  />}
                    />


                </Switch>

                </div> : null}
            </div>
        )
    }
}

MyPageHome.defaultProps = {
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
      alert_obj : state.signup.alert_obj,
      coupon_list_open_modal : state.my_page.coupon_list_open_modal,
      coupon_loading : state.my_page.coupon_loading,
      coupon_list : state.my_page.coupon_list,
      coupon_add_loading : state.my_page.coupon_add_loading,
      cart_coupon_price : state.my_page.cart_coupon_price,
      cart_final_price : state.my_page.cart_final_price
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(MyPageHome);