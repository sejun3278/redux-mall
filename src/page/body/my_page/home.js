import React, { Component } from 'react';
import axios from 'axios';

import { 
    MyPage, ModifyUser, LikeList, Cart, Order, Coupon, Order_complate, OrderList, QnA, Review
} from './index';

import { Route, Switch } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../../../Store/modules/signup';
import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';
import * as orderAction from '../../../Store/modules/order';

// import img from '../../../source/img/icon.json';
import page_list from '../../../source/myPage.json';

import '../../../css/responsive/signup.css';
import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';

import $ from 'jquery';

class MyPageHome extends Component {

    async componentDidMount() {
        const { _loginCookieCheck, _getCouponList } = this.props;

        await _loginCookieCheck();
        _getCouponList();
    }

    _toggleCouponListModal = (bool) => {
        const { myPageAction } = this.props;

        return myPageAction.toggle_coupon_modal({ 'bool' : bool })
    }

    _removeCoupon = () => {
        const { myPageAction, cart_result_price, use_point } = this.props;

        const obj = {};
        obj['obj'] = JSON.stringify({});
        obj['cover'] = JSON.stringify({});

        const price_obj = {};
        price_obj['coupon_price'] = 0;
        price_obj['final_price'] = cart_result_price - use_point;

        if(window.confirm('해당 쿠폰을 해제하시겠습니까?')) {
            myPageAction.save_cart_result_price(price_obj);
            return myPageAction.select_coupon(obj);        
        }
    }

        // 포인트 사용하기
        _setPonit = async () => {
            const { myPageAction, configAction, user_info, cart_result_price, cart_coupon_price } = this.props;
            // const { _saveData } = this;
            // const order_info = JSON.parse(this.props.order_info);
    
            let point = $('input[name=use_point_input]').val();

            if(point === 0) {
                return;
            }
    
            if(point < 1000 && point > 0) {
                $('input[name=use_point_input]').val(0)
    
                return alert('1,000 포인트 이상부터 사용 가능합니다.');
            }
    
            if(point < 0) {
                point = 0;
    
            } else if(point > user_info.point) {
                point = user_info.point;

            } else if(point > cart_result_price) {
                point = cart_result_price
            }

            point = Number(point)
    
            $('input[name=use_point_input]').val(point)
            const get_check = await this._infoCheck();
    
            if(point > get_check.point) {
                alert(get_check.point + ' 포인트까지 사용할 수 있습니다.');
                const cover_point = get_check.point > 1000 ? get_check.point : 0;
    
                $('input[name=use_point_input]').val(cover_point);
                return myPageAction.save_cart_result_price({ 'use_point' : cover_point });
    
            } else {
                let point_obj = { 'use_point' : point };
                
                // let final_price = ((cart_result_price - cart_coupon_price) + cart_delivery_price) - point;

                let final_price = cart_result_price - (cart_coupon_price + point);

                if(final_price < 0) {
                    final_price = 0;
                }

                point_obj['final_price'] = final_price;
                point_obj['result_price'] = cart_result_price; 
                point_obj['coupon_price'] = cart_coupon_price;

                point_obj = this._autoChangePoint(point, point_obj);

                myPageAction.save_cart_result_price(point_obj);
                configAction.save_user_info({ 'info' : JSON.stringify(get_check) })
    
                // return _saveData(order_info);
            }
        }
    
        _infoCheck = async () => {
            const { user_info, _loginCookieCheck } = this.props;

            const obj = { 'type' : 'SELECT', 'table' : 'userInfo', 'comment' : '유저 포인트 정보 체크' };
            _loginCookieCheck();

            obj['option'] = {};
            obj['option']['user_id'] = '=';
      
            obj['where'] = [];
            obj['where'].push({ 'table' : 'userInfo', 'key' : 'user_id', 'value' : user_info.user_id });
      
            const data_check = await axios(URL + '/api/query', {
              method : 'POST',
              headers: new Headers(),
              data : obj
            })
    
            if(data_check.data[0][0]) {
                return data_check.data[0][0];
            }
    
            alert('유저 정보가 일치하지 않습니다.');
            return window.location.replace('/');
        }

        // 비용에 따라 자동으로 포인트 조절하기
        _autoChangePoint = (use_point, obj) => {
            const { myPageAction } = this.props;
    
            obj['use_point'] = use_point;

            
            let cover_result_price = Number(obj['result_price'] - obj['coupon_price']);
            if(use_point > cover_result_price) {
                // 포인트가 비용보다 더 클 경우
                obj['use_point'] = cover_result_price;
            }
            
            $('input[name=use_point_input]').val(obj['use_point']);
            obj['final_price'] = cover_result_price - obj['use_point'];

            myPageAction.save_cart_result_price(obj);
            return obj;
        }

    render() {
        const { 
            user_info, _getCookie, price_comma, _modalToggle, admin_info, coupon_list_open_modal, _setModalStyle, 
            _loginCookieCheck, _addCoupon, _getCouponList, _setPoint, _checkLogin, _filterURL, _hashString, _moveScrollbar, _setGoodsStock,
            _removeReview, _checkScrolling, _searchStringColor
        } = this.props;

        const coupon_list = JSON.parse(this.props.coupon_list);
        const { _toggleCouponListModal, _removeCoupon, _setPonit, _autoChangePoint } = this;

        const qry = this.props.location.pathname;
        const path = qry.split('/')[2];

        let page_name = "마이 페이지"
        let page_icon = icon.my_page.my_page
        if(path !== undefined) {
            page_name = page_list.myPage.page_name[path];
            page_icon = icon.my_page[path +  '_black']
        }

        const move_url = '/myPage/' + path;
        return(
            <div id='my_page_div'>
                {user_info ? <div>
                <div id='my_page_title_div' className='my_page_title border_bottom'>
                    <img src={page_icon} alt='' className='pointer' onClick={() => window.location.href = move_url }/>
                    <b className='aCenter pointer' onClick={() => window.location.href = move_url }> {page_name} </b>
                </div>
                
                <Switch>
                    {/* 마이페이지 홈 */}
                    <Route path='/myPage' exact
                        render={(props) => <MyPage
                            user_info={user_info}
                            coupon_list={coupon_list}
                            price_comma={price_comma}
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
                            _removeCoupon={_removeCoupon}
                            coupon_list_open_modal={coupon_list_open_modal}
                            _setModalStyle={_setModalStyle}
                            _setPonit={_setPonit}
                            _autoChangePoint={_autoChangePoint}
                            _loginCookieCheck={_loginCookieCheck}
                            _addCoupon={_addCoupon}
                            _getCouponList={_getCouponList}
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
                            _addCoupon={_addCoupon}
                            _getCouponList={_getCouponList}
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
                            _setPonit={_setPonit}
                            _getCouponList={_getCouponList}
                            _loginCookieCheck={_loginCookieCheck}
                            _setPoint={_setPoint}
                            _checkLogin={_checkLogin}
                             _hashString={_hashString}
                        {...props}  />}
                    />

                    <Route path='/myPage/orderComplate'
                        render={(props) => <Order_complate
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _hashString={_hashString}
                        {...props}  />}
                    />

                    <Route path='/myPage/order_list'
                        render={(props) => <OrderList
                            user_info={user_info}
                            _getCookie={_getCookie}
                            price_comma={price_comma}
                            _filterURL={_filterURL}
                            _hashString={_hashString}
                            _moveScrollbar={_moveScrollbar}
                            _setPoint={_setPoint}
                            _setGoodsStock={_setGoodsStock}
                            _setModalStyle={_setModalStyle}
                            _removeReview={_removeReview}
                        {...props}  />}
                    />

                    {/* 문의 / 답변 */}
                    <Route path='/myPage/QandA'
                        render={(props) => <QnA
                            user_info={user_info}
                            price_comma={price_comma}
                            _checkScrolling={_checkScrolling}
                            _checkLogin={_checkLogin}
                            _filterURL={_filterURL}
                            _searchStringColor={_searchStringColor}
                        {...props}  />}
                    />

                    {/* 리뷰 */}
                    <Route path='/myPage/star'
                        render={(props) => <Review
                            user_info={user_info}
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
      cart_final_price : state.my_page.cart_final_price,
      cart_result_price : state.my_page.cart_result_price,
      cart_delivery_price : state.my_page.cart_delivery_price,
      use_point : state.my_page.use_point
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch)
    })
  )(MyPageHome);