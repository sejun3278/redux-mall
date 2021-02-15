import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';
// import '../../css/responsive/signup.css';

import URL from '../../config/url';
import $ from 'jquery';

// 주문 처리하기
class OrderCheck extends Component {

    async componentDidMount() {
        const { _getCookie } = this.props;

        $('.App').hide();

        const order_check = await _getCookie('order_check', 'get');
        const user_cookie = await _getCookie('login', 'get');

        const check = await this._acessCheck(order_check, user_cookie);
        if(check === false) {
            await this._complateOrder(order_check, user_cookie);
        }

    }

    // 접근 체크하기
    _acessCheck = async(order_check, user_cookie) => {
        const { _hashString, user_info } = this.props;
        const acess_session = JSON.parse(sessionStorage.getItem(_hashString('order_check')));

        const session_user_id = _hashString(user_info.user_id);
        const session_order_id = _hashString(String(order_check.order_info.id));

        let acess_check = false;
        if(user_info.id === undefined || user_info.user_id !== user_cookie || acess_session === null) {
            acess_check = true;

        } else {
            if(acess_session[_hashString('user_id')] !== session_user_id || acess_session[_hashString('order_id')] !== session_order_id) {
                acess_check = true;
            }
        }

        // 이전 페이지 검색
        if(document.referrer.includes('/myPage/order') === false) {
            // 이전 페이지가 주문하기 (order) 페이지가 아닐 경우
            acess_check = true;
        }

        if(acess_check === true) {
            alert('비정상적인 접근입니다.');
            return window.location.replace('/');
        }

        return acess_check;
    }

    // 주문 진행하기
    _complateOrder = async (order_check) => {
        const { user_info, _setPoint, _getCookie, _hashString, _setGoodsStock } = this.props;

        // 0. 상세 주문 정보 추가
        const insert_order_info = await this._addDetailOrderInfo(order_check.form_data, order_check.order_info, order_check.payment_info);
        if(insert_order_info === false) {
            alert('주문 처리에 문제가 발생했습니다. \n관리자에게 문의해주세요.');
            return window.location.replace('/');
        }

        // 1. 장바구니 처리
        await this._removeCart(order_check.cart_data);

        // 2. 주문 처리
        await this._updateOrder(order_check, order_check.payment_info.payment_state);

        // let user_point = user_info.point;
        let point_comment = '';

        const order_id = order_check.order_info.id;
        const prediction_point = order_check.payment_info.prediction_point;

        // 3. 포인트 처리 (포인트 사용시)
        if(order_check.payment_info.use_point > 0) {
            const use_point = order_check.payment_info.use_point;

            point_comment = order_id + ' 번 주문 구매로 인한 포인트 사용 ( -' + use_point + ' P )';

            await _setPoint(use_point, 'remove', point_comment, user_info.id); 
        }

        // 4. 쿠폰 처리 (쿠폰 사용시)
        if(order_check.payment_info.coupon_price > 0) {
            await this._useCouponComplate(order_check.order_info, order_check.payment_info.use_coupon);
        }

        if(order_check.payment_info.payment_state === true) {
            // 결제 완료 (카드, 포인트 결제)

            // 5. 포인트 적립하기
            if(prediction_point > 0) {
                point_comment = order_id + ' 번 주문 구매로 인한 포인트 적립 ( ' + prediction_point + ' P )';
                await _setPoint(prediction_point, 'add', point_comment, user_info.id);
            }

            // 6. 상품 재고 최신화
            await _setGoodsStock(order_check.order_info, 'remove');
        }

        const complate = {};
        complate['user_id'] = user_info.user_id;
        complate['order_id'] = order_check.order_info.id;
        complate['coupon_select'] = order_check.payment_info.use_coupon
        complate['cart_list'] = order_check.cart_data

        // 쿠키 추가하기
        await _getCookie('order_complate', 'add', JSON.stringify(complate), { 'time' : 60 } );

        // 세션 추가하기
        const session_obj = {};
        session_obj[_hashString('order_id')] = _hashString(String(order_check.order_info.id));
        session_obj[_hashString('user_id')] = _hashString(String(user_info.id));

        sessionStorage.setItem(_hashString('order_complate'), JSON.stringify(session_obj));

        sessionStorage.removeItem(_hashString('order_check'));
        await _getCookie('order_check', 'remove');

        return window.location.replace('/myPage/orderComplate');
    }

    // 0. 상세 주문 정보 추가하기
    _addDetailOrderInfo = async (form_data, order_info, payment_info) => {
        const { user_info } = this.props;
        const obj = { 'type' : 'INSERT', 'table' : 'order_info', 'comment' : '상세 주문 정보 추가' };

        const order_info_agree = form_data.info_agree;
        const cart_final_price = payment_info.final_price;

        obj['columns'] = [];
        obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
        obj['columns'].push({ "key" : "order_id", "value" : order_info.id });
        obj['columns'].push({ "key" : "final_price", "value" : cart_final_price });
        obj['columns'].push({ "key" : "get_user_name", "value" : form_data.get_user_name });
        obj['columns'].push({ "key" : "get_host_code", "value" : form_data.order_host_code });
        obj['columns'].push({ "key" : "get_host", "value" : form_data.order_host });
        obj['columns'].push({ "key" : "get_host_detail", "value" : form_data.order_host_detail });
        obj['columns'].push({ "key" : "get_phone", "value" : form_data.get_user_phone });
        obj['columns'].push({ "key" : "delivery_message", "value" : form_data.deilvery_message });
        obj['columns'].push({ "key" : "post_name", "value" : form_data.post_name });
        obj['columns'].push({ "key" : "post_email", "value" : form_data.post_email });
        obj['columns'].push({ "key" : "post_phone", "value" : form_data.post_phone });
        obj['columns'].push({ "key" : "create_date", "value" : null });
        obj['columns'].push({ "key" : "info_agree", "value" : order_info_agree === true ? 1 : 0 });

        const insert_order_info = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });

        let result = true;

        if(!insert_order_info.data[0]) {
            result = false;
        }

        return result;
    }

    // 1. 장바구니 처리
    _removeCart = async (cart_data) => {
        const { user_info } = this.props;

        // 장바구니에서 삭제
        const delete_cart = { 'type' : 'UPDATE', 'table' : 'cart', 'comment' : '장바구니에서 구매로 업데이트' };

        let where_limit = 1;
        delete_cart['columns'] = [];
        delete_cart['columns'][0] = { 'key' : 'state', 'value' : 0 };
        delete_cart['columns'][1] = { 'key' : 'buy_date', 'value' : null };

        delete_cart['where'] = [];
        
        delete_cart['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };

        cart_data.forEach( async (el) => {
            delete_cart['where'][1] = { 'key' : 'id', 'value' : el.id }
            delete_cart['where_limit'] = where_limit;

            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : delete_cart
            })
        })
    }

    // 2. 주문 처리
    _updateOrder = async (order_info, buy_complate) => {
        const { user_info } = this.props;

        const payment_select = order_info.payment_info.payment_type;
        const use_point = order_info.payment_info.use_point;
        const cart_coupon_price = order_info.payment_info.coupon_price;
        const cart_final_price = order_info.payment_info.final_price
        const coupon_id = order_info.payment_info.use_coupon.id;

        // order 테이블 state 변경하기
        const update_order = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '주문 상황 상태 업데이트' };

        update_order['where_limit'] = 1;

        let order_type = payment_select === 'bank_pay' ? 1 : 2;
        order_type = buy_complate === true ? 3 : order_type;

        let payment_state = payment_select === 'card' ? 1 : 0;
        payment_state = buy_complate === true ? 1 : payment_state;

        let delivery_state = payment_state === 1 ? 1 : 0

        update_order['columns'] = [];
        update_order['columns'].push({ 'key' : 'order_type', 'value' : order_type });
        update_order['columns'].push({ 'key' : 'buy_date', 'value' : null });
        update_order['columns'].push({ 'key' : 'payment_state', 'value' : payment_state });
        update_order['columns'].push({ 'key' : 'point_price', 'value' : use_point });
        update_order['columns'].push({ 'key' : 'coupon_price', 'value' : cart_coupon_price });
        update_order['columns'].push({ 'key' : 'final_price', 'value' : cart_final_price });
        update_order['columns'].push({ 'key' : 'order_state', 'value' : 1 });
        update_order['columns'].push({ 'key' : 'delivery_state', 'value' : delivery_state });

        if(coupon_id) {
            update_order['columns'].push({ 'key' : 'coupon_id', 'value' : coupon_id });
        }

        if(order_type !== 1) {
            update_order['columns'].push({ 'key' : 'payment_date', 'value' : null });
        }
        
        update_order['where'] = [];        
        update_order['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
        update_order['where'][1] = { 'key' : 'id', 'value' : order_info.order_info.id };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_order
        })
    }

     // 3. 쿠폰 사용 처리하기
     _useCouponComplate = async (order_info, coupon_select) => {
        const { user_info } = this.props;

        const obj = { 'type' : 'UPDATE', 'table' : 'coupon', 'comment' : '쿠폰 사용하기' };

        obj['columns'] = [];
        obj['columns'][0] = { 'key' : 'state', 'value' : 1 };
        obj['columns'][1] = { 'key' : 'use_date', 'value' : null };
        obj['columns'][2] = { 'key' : 'use_order_id', 'value' : order_info.id };

        obj['where'] = [];
        obj['where'].push({ 'key' : 'user_id', 'value' : user_info.user_id });
        obj['where'].push({ 'key' : 'code', 'value' : coupon_select.code });
        obj['where'].push({ 'key' : 'id', 'value' : coupon_select.id });
    
        obj['where_limit'] = obj['where'].length - 1;
        
        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });
    }

    // // 6. 상품 재고 최신화
    // _setGoodsStock = async (cart_data, order_info) => {
    //     const obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '상품 재고 최신화' };

    //     obj['columns'] = [];
    //     obj['where'] = [];
    //     obj['where_limit'] = 0;

    //     const set_goods_stock = async () => {
    //         return await cart_data.forEach( async (el) => {
    //             const num = order_info.goods_num ? order_info.goods_num : el.num;
    //             const cover_stock = el.stock ? el.stock : el.goods_stock;
    //             const stock = (cover_stock - num) < 0 ? 0 : cover_stock - num;

    //             obj['columns'][0] = { 'key' : 'stock', 'value' : stock };
    //             obj['where'][0] = { 'key' : 'id', 'value' : el.goods_id }

    //             await axios(URL + '/api/query', {
    //                 method : 'POST',
    //                 headers: new Headers(),
    //                 data : obj
    //             });
    //         });
    //     }

    //     return await set_goods_stock();
    // }

    render() {

        return(
            <div />
        )
    }
}

OrderCheck.defaultProps = {
  }
  
  export default connect(
    (state) => ({
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(OrderCheck);