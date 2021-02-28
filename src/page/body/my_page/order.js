import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import DaumPostcode from 'react-daum-postcode';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';
import * as orderAction from '../../../Store/modules/order';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';
import CouponList from '../my_page/coupon_list';

import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';
import info_agree from '../../../config/info'
  
Modal.setAppElement('body');

let order_state = false;

const IMP = window.IMP; // 생략가능
IMP.init('imp05067701');

class Order extends Component {

    async componentDidMount () {
        const acess = await this._checkAcess();

        if(acess['bool']) {
            const { user_info, orderAction } = this.props;

            const result = {
                "order_host_code" : user_info.host_code,
                "order_host" : user_info.host
            }
      
            orderAction.set_order_host(result);

            if(user_info.phone && user_info.email) {
                // this._sameDeliveryInfo(true);
            }

        } else {
            if(acess['alert'] !== null) {
                alert(acess['alert']);
            }

            alert('비정상적인 접근입니다.');
            window.location.replace('/');
        }
    }

    _checkAcess = async () => {
        const { user_info, _getCookie, myPageAction, orderAction, _stringCrypt } = this.props;
        const cookie_info = await _getCookie("order", "get", null, true);
        const cookie_check = JSON.parse(JSON.parse(_stringCrypt(cookie_info, "_order_cookie_data", false)));

        const check_result = { "bool" : true, "alert" : null };
        // 장바구니 접근 여부 체크하기
        if(!user_info || !cookie_check) {
            check_result['bool'] = false;

        } else {
            // 유저 아이디 체크
            if(cookie_check.user_id !== user_info.id) {
                check_result['alert'] = '비정상적인 접근입니다.';
                check_result['bool'] = false;
            }

            orderAction.save_order_info({ 'buy_info' : JSON.stringify(cookie_check) })

            const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '주문 정보 가져오기' };

            obj['option'] = {};

            obj['option']['user_id'] = '=';
            obj['option']['code'] = '=';

            obj['where'] = [];
            obj['where'][0] = { 'table' : 'order', 'key' : 'user_id', 'value' : user_info.id };
            obj['where'][1] = { 'table' : 'order', 'key' : 'code', 'value' : cookie_check.code };

            obj['order'] = []
            obj['order'][0] = { 'table' : 'order', 'key' : 'id', 'value' : "DESC" };
            obj['order'][1] = { 'table' : 'order', 'key' : 'limit', 'value' : "1" };

            const query_result = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(query_result.data[0][0].order_type !== 0) {
                alert('처리 완료된 주문입니다.');
                return window.location.replace('/')
            }

            this._saveData(query_result.data[0][0], cookie_check.coupon_price, cookie_check.use_point );
        }

        // 쿠폰 설정하기
        const coupon_obj = {};

        if(cookie_check.coupon) {
            coupon_obj['obj'] = JSON.stringify(cookie_check.coupon);
            coupon_obj['cover'] = JSON.stringify(cookie_check.coupon);

            myPageAction.save_cart_result_price({ 'coupon_price' : cookie_check.coupon_price })
            myPageAction.select_coupon(coupon_obj);
        }

        // 포인트 설정하기
        if(cookie_check.use_point > 0) {
            myPageAction.save_cart_result_price({ 'use_point' : cookie_check.use_point });
        }
        
        return check_result;
    }

    _saveData = async (order_data, coupon, point) => {
        const { orderAction, myPageAction, cart_coupon_price, use_point } = this.props;

        // 가격 설정하기
        const price_obj = {};

        price_obj['origin_price'] = order_data.origin_price;
        price_obj['result_price'] = order_data.result_price;
        price_obj['discount_price'] = order_data.discount_price;
        price_obj['delivery_price'] = order_data.delivery_price;

        price_obj['coupon_price'] = coupon !== null ? coupon : cart_coupon_price;
        price_obj['use_point'] = point !== null ? Number(point) : Number(use_point);

        const save_data = {};
        save_data['order_info'] = JSON.stringify(order_data);

        const cart_list = JSON.parse(order_data.cart_list);

        const get_cart_data = await this._saveCartList(cart_list);
        
        save_data['cart_data'] = JSON.stringify(get_cart_data);
        save_data['loading'] = true;

        const result_price_bill = (order_data.origin_price - order_data.discount_price) + price_obj['delivery_price'];
        price_obj['result_price'] = result_price_bill;

        let opt_price = 0;
        if(price_obj['coupon_price'] || price_obj['use_point']) {
            opt_price = price_obj['coupon_price'] + price_obj['use_point'];
        }

        const final_price = result_price_bill - (opt_price);
        price_obj['final_price'] = final_price > 0 ? final_price : 0;

        // 예상 적립 포인트
        const prediction_point = Math.trunc((order_data.result_price - order_data.delivery_price) * 0.01);
        price_obj['point'] = prediction_point;

        myPageAction.save_cart_result_price(price_obj);

        return orderAction.save_order_info(save_data)
    }

    _saveCartList = async (list) => {
        const { user_info } = this.props;
        // const order_info = JSON.parse(this.props.order_info);
        // const order_cookie = JSON.stringify(await _getCookie('order', 'get', null, true));
        const order_cookie = JSON.parse(this.props.buy_order_info);

        let obj = {};
        let save_cart_data = [];

        if(!order_cookie.direct_buy) {
            obj = { 'type' : 'SELECT', 'table' : 'cart', 'comment' : '장바구니 및 상품 정보 조회', 'join' : true, 'join_table' : 'goods' };

            if(obj['join'] === true) {
                obj['join_arr'] = [];
                obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'goods_id' }

                obj['join_where'] = [];
                obj['join_where'][0] = { 'columns' : 'result_price', 'as' : 'goods_result_price' }
                obj['join_where'][1] = { 'columns' : 'stock', 'as' : 'goods_stock' }
                obj['join_where'][2] = { 'columns' : 'state', 'as' : 'goods_state' }
                obj['join_where'][3] = { 'columns' : 'thumbnail', 'as' : 'thumbnail' }
                obj['join_where'][4] = { 'columns' : 'id', 'as' : 'goods_id' }
                obj['join_where'][5] = { 'columns' : 'name', 'as' : 'goods_name' }
                obj['join_where'][6] = { 'columns' : 'discount_price', 'as' : 'goods_discount_price' }
                obj['join_where'][7] = { 'columns' : 'origin_price', 'as' : 'goods_origin_price' }
            }

            obj['option'] = {};
            obj['option']['user_id'] = '=';
            obj['option']['id'] = '=';

            obj['where'] = [];
            obj['where'][0] = { 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id };

            let limit_cnt = 0;

            const get_cart_data = async (obj) => {
                obj['where'][1] = { 'table' : 'cart', 'key' : 'id', 'value' : list[limit_cnt] };
                const query_result = await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                save_cart_data.push(query_result.data[0][0]);
                limit_cnt += 1;

                if(limit_cnt === list.length) {
                    return save_cart_data;
                }

                return get_cart_data(obj);
            }

            const result_data = await get_cart_data(obj);
            return result_data;

        } else {
            // 바로 구매한 경우
            obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '장바구니 및 상품 정보 조회 (바로 구매)' };
            
            obj['option'] = {};
            obj['option']['id'] = '=';

            obj['where'] = [];
            obj['where'].push({ 'table' : 'goods', 'key' : 'id', 'value' : order_cookie.select_list });

            const query_result = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            const result_obj = query_result.data[0][0];

            result_obj['goods_result_price'] = result_obj.origin_price * order_cookie.goods_num;
            result_obj['goods_stock'] = result_obj.state;
            result_obj['goods_state'] = result_obj.stock;
            result_obj['goods_id'] = result_obj.id;
            result_obj['goods_name'] = result_obj.name;
            result_obj['goods_discount_price'] = result_obj.discount_price;
            result_obj['goods_origin_price'] = result_obj.origin_price;
            result_obj['price'] = result_obj.result_price;

            save_cart_data.push(result_obj);

            return save_cart_data;
        }

    }

    _toggleModal = (bool) => {
        const { orderAction } = this.props;

        return orderAction.toggle_delivery_code_modal({ 'bool' : bool })
    }

    _handleComplete = (data) => {
        const { orderAction } = this.props;

        // let fullAddress = data.address;
        // let extraAddress = ''; 
        
        // if (data.addressType === 'R') {
        //   if (data.bname !== '') {
        //     extraAddress += data.bname;
        //   }
        //   if (data.buildingName !== '') {
        //     extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        //   }
        //   fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        // }

        const result = {
          "order_host_code" : data.zonecode,
          "order_host" : data.address
        }

        orderAction.set_order_host(result);
    
        return this._toggleModal(false);
    
        // console.log(fullAddress);  // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
      }

    _sameDeliveryInfo = (bools) => {
        const { orderAction, user_info, cover_order_name, cover_order_email, cover_order_phone, order_same_info_bool } = this.props;
        const bool = bools !== null ? bools : !order_same_info_bool;

        $('#same_delivery_info_button').prop("checked", bool)

        // console.log(user_info)

        if(bool === true) {
            $('#same_delivery_info').addClass('bold black');

            const user_name = $('input[name=order_delivery_name]').val().trim() ? $('input[name=order_delivery_name]').val().trim() : user_info.name;
            const user_phone = $('input[name=order_delievery_phone]').val().trim() ? $('input[name=order_delievery_phone]').val().trim() : user_info.phone;

            $('input[name=order_post_user_name]').val(user_name);
            $('input[name=order_post_user_email]').val(user_info.email);
            $('input[name=order_post_user_phone]').val(user_phone);

        } else if(bool === false) {
            $('#same_delivery_info').removeClass('bold black')

            $('input[name=order_post_user_name]').val(cover_order_name);
            $('input[name=order_post_user_email]').val(cover_order_email);
            $('input[name=order_post_user_phone]').val(cover_order_phone);
        }

        return orderAction.toggle_delivery_same_info({ 'bool' : bool })
    }

    _saveCoverOrderInfo = (type) => {
        const { orderAction } = this.props;
        const data = $('input[name=order_post_user_' + type + ']').val();

        const obj = {};
        obj[type] = data;

        return orderAction.set_cover_order_info(obj)
    }

    _agreeSaveUserInfo = (click) => {
        const { orderAction, order_info_agree } = this.props;
        const bool = !order_info_agree;

        if(click) {
            $('#agree_userInfo_button').prop("checked", bool);
        }

        if(bool === true) {
            $('#user_info_agree_input').addClass('bold');
            $('#user_info_agree_input').css({ 'color' : '#35c5f0' });

        } else if(bool === false) {
            $('#user_info_agree_input').removeClass('bold');
            $('#user_info_agree_input').css({ 'color' : 'black' });
        }

        return orderAction.toggle_order_info_agree({ 'bool' : bool });
    }

    _modalUserInfoAgree = () => {
        $('#agree_userInfo_button').prop("checked", true);

        $('#user_info_agree_input').addClass('bold');
        $('#user_info_agree_input').css({ 'color' : '#35c5f0' });

        this.props.orderAction.toggle_order_info_agree({ 'bool' : true });
        return this.props.configAction.toggle_agree_modal({ 'bool' : false });
    }

    // 주문하기
    _order = async (event) => {
        const { 
            cart_final_price, _loginCookieCheck, payment_agree, payment_pay_agree, payment_select, user_info
        } = this.props;

        const form_data = event.target;
        event.preventDefault();
        
        if(!window.confirm('위의 사항으로 결제를 진행하시겠습니까?')) {
            return;
        }
        
        if(payment_select === 'card') {
            if(cart_final_price < 500) {
                alert('카드 결제의 최소 결제 금액은 500 원 이상입니다. \n무통장 입금을 이용해주세요.');
                return;
            }
        }

        if(order_state === true) {
            return alert('잠시만 기다려주세요.');
        }

        const order_info = JSON.parse(this.props.order_info);
        order_state = true;

            const login_check = await _loginCookieCheck();
            if(login_check === false) {
                return;
            }

            // 입력 폼 체크하기
            const form_check = this._checkForm(form_data);
            const form_result = form_check["bool"];
            const form_obj = form_check["data"];

            if(form_result === false) {
                order_state = false;
                return;
            }

            // 결제 방법 체크
            if(!payment_select && cart_final_price > 0) {
                order_state = false;
                return alert('결제 방법을 선택해주세요.');
            }

            if(!payment_agree || !payment_pay_agree) {
                order_state = false;
                return alert('결제 약관에 모두 동의해주세요.');
            }
            
            const { use_point, cart_coupon_price, prediction_point, order_info_agree } = this.props;
            const coupon_select = JSON.parse(this.props.coupon_select)
            const cart_data = JSON.parse(this.props.cart_data)

            form_obj['info_agree'] = order_info_agree;

            // 쿠키에 추가할 오브젝트 구성하기
            const cookie_obj = { };
            cookie_obj['user_id'] = user_info.id;
            cookie_obj['form_data'] = form_obj;
            cookie_obj['order_info'] = order_info;
            cookie_obj['cart_data'] = cart_data;

            cookie_obj['payment_info'] = {};
            cookie_obj['payment_info']['payment_type'] = payment_select;
            cookie_obj['payment_info']['payment_state'] = payment_select === 'bank_pay' ? false : true;
            cookie_obj['payment_info']['use_point'] = use_point > 0 ? use_point : 0;
            cookie_obj['payment_info']['use_coupon'] = coupon_select ? coupon_select : null;
            cookie_obj['payment_info']['coupon_price'] = cart_coupon_price > 0 ? cart_coupon_price : 0;
            cookie_obj['payment_info']['final_price'] = cart_final_price;
            cookie_obj['payment_info']['prediction_point'] = prediction_point;

            // 포인트가 사용된 경우
            let point_check = true;
            let coupon_check = true;

            if(use_point > 0) {
            // 포인트 체크하기
                point_check = await this._orderOptionCheck('point');
            }

            if(cart_coupon_price > 0) {
            // 쿠폰 체크하기
                coupon_check = await this._orderOptionCheck('coupon');
            }

            if(point_check === false || coupon_check === false) {
                order_state = false;
                return;
            }

            if(cart_final_price > 0) {
                if(payment_select === 'bank_pay') {
                    // 무통장 입금인 경우
                    cookie_obj['payment_info']['payment_state'] = false; 

                    return this._moveOrderCheck(cookie_obj);

                    // return this._complateOrder(payment_select, false, form_data);

                } else {
                    const { _hashString, _getCookie, _stringCrypt, _checkDevice } = this.props;

                    // 카드 결제인 경우
                    const host = form_obj['order_host'] + ' ' + form_obj['order_host_detail'];

                    cookie_obj['payment_info']['payment_state'] = true;

                    // const session_obj = {};
                    cookie_obj[_hashString('user_id')] = _hashString(user_info.user_id);
                    cookie_obj[_hashString('order_id')] = _hashString(String(cookie_obj.order_info.id));
            
                    await _getCookie('order_check', 'add', _stringCrypt(JSON.stringify(cookie_obj), "_order_check", true), true);
                    // sessionStorage.setItem(_hashString('order_check'), JSON.stringify(session_obj));

                    // 모바일 체크하기
                    const check_mobile = _checkDevice();
                    let redirect = '';
                    if(check_mobile) {
                        redirect = 'http://sejun-redux-mall.s3-website.ap-northeast-2.amazonaws.com/orderCheck'
                    }
                    console.log(redirect)

                    IMP.request_pay({
                        pg : 'kcp', // version 1.1.0부터 지원.
                        pay_method : 'card',
                        merchant_uid : 'merchant_' + new Date().getTime(),
                        name : order_info.order_title,
                        amount : cart_final_price,
                        buyer_email : form_obj['post_email'],
                        buyer_name : form_obj['post_name'],
                        buyer_tel : form_obj['post_phone'],
                        buyer_addr : host,
                        buyer_postcode : form_obj['order_host_code'],
                        m_redirect_url : redirect

                    }, async function(rsp) {
                        if ( rsp.success ) {
                                // var msg = '결제가 완료되었습니다.';
                                // msg += '고유ID : ' + rsp.imp_uid;
                                // msg += '상점 거래ID : ' + rsp.merchant_uid;
                                // msg += '결제 금액 : ' + rsp.paid_amount;
                                // msg += '카드 승인번호 : ' + rsp.apply_num;

                                return window.location.replace('/orderCheck');

                        } else {
                            // console.log(rsp)

                            let msg = '결제에 실패하였습니다. \n';
                            msg += '( ' + rsp.error_msg + ' )';

                            await _getCookie('order_check', 'remove', null, true);
                            // sessionStorage.removeItem(_hashString('order_check'));

                            alert(msg);
                        }
                    });
                }

            } else {
                // 결제 금액이 0 일 경우
                cookie_obj['payment_info']['payment_state'] = true;

                return this._moveOrderCheck(cookie_obj);
                // return this._complateOrder(payment_select, true, form_data);
            }

        order_state = false;
    }

    _moveOrderCheck = async (cookie_obj) => {
        const { _getCookie, user_info, _hashString, _stringCrypt } = this.props;

        // const session_obj = {};
        cookie_obj[_hashString('user_id')] = _hashString(user_info.user_id);
        cookie_obj[_hashString('order_id')] = _hashString(String(cookie_obj.order_info.id));

        await _getCookie('order_check', 'add', _stringCrypt(JSON.stringify(cookie_obj), "_order_check", true), true);
        // sessionStorage.setItem(_hashString('order_check'), JSON.stringify(session_obj));

        return window.location.replace('/orderCheck');
    }

    _complateOrder = async (type, payment, form_data) => {
        const { prediction_point, user_info, _setPoint, use_point, cart_coupon_price, _getCookie, coupon_select } = this.props;
        const order_info = JSON.parse(this.props.order_info);

        let order_able = true;
        let point_comment = '';

        let point_check = true;
        let coupon_check = true;

        // 포인트가 사용된 경우
        if(use_point > 0) {
            point_check = await this._orderOptionCheck('point');
        }

        if(cart_coupon_price > 0) {
        // 쿠폰 사용할 경우
            coupon_check = await this._orderOptionCheck('coupon');
        }

        if(point_check && coupon_check) {
            if(order_able === true) {
                // 상세 주문 정보 추가
                const insert_order_info = await this._addDetailOrderInfo(form_data);
                if(insert_order_info === false) {
                    alert('주문 정보를 생성할 수 없습니다. \n관리자에게 문의해주세요.');
                    order_state = false;

                    return;
                }

                // 장바구니 처리
                await this._removeCart();

                // 주문 처리
                await this._updateOrder(payment);

                // let user_point = user_info.point;
                if(use_point > 0) {
                    // 포인트 사용
                    point_comment = order_info.id + ' 번 주문 구매로 인한 포인트 사용 ( -' + use_point + ' P )';

                    await _setPoint(use_point, 'remove', point_comment, user_info.id); 
                }

                if(cart_coupon_price > 0) {
                    // 쿠폰 사용
                    await this._useCouponComplate();
                }

                if(type === 'card' || payment === true) {
                    // 카드 결제나 결제 금액이 0 일 경우 포인트 바로 적립

                    // 포인트 적립하기
                    if(prediction_point > 0) {
                        point_comment = order_info.id + ' 번 주문 구매로 인한 포인트 적립 ( ' + prediction_point + ' P )';
                        await _setPoint(prediction_point, 'add', point_comment, user_info.id);
                    }

                    // 상품 재고 최신화
                    await this._setGoodsStock();
                }

                const complate = {};
                complate['user_id'] = user_info.user_id;
                complate['order_id'] = order_info.id;
                complate['coupon_select'] = JSON.parse(coupon_select);
                complate['cart_list'] = JSON.parse(this.props.cart_data);

                // 쿠키 추가하기
                await _getCookie('order_complate', 'add', JSON.stringify(complate), true );
                await _getCookie('order', 'remove', null, true);

                return window.location.replace('/myPage/orderComplate');

            } else {
                return;
            }
        }
    }

    // 상세 주문 정보 추가하기
    _addDetailOrderInfo = async (form_data) => {
        const { order_info_agree, user_info, cart_final_price, order_host_code, order_host } = this.props;
        const obj = { 'type' : 'INSERT', 'table' : 'order_info', 'comment' : '상세 주문 정보 추가' };
        const order_info = JSON.parse(this.props.order_info);

        const get_user_name = order_info_agree === false ? "김세준" : form_data.order_delivery_name.value.trim();
        const cover_order_host_code = order_info_agree === false ? "14X1X" : order_host_code;
        const cover_order_host = order_info_agree === false ? "경기 광명시 하안로 XXX" : order_host;
        const order_host_detail = order_info_agree === false ? "XXX동 XXX호" : form_data.order_delievery_detail_host.value.trim();
        const get_user_phone = order_info_agree === false ? "010-8XX6-3XX8" : form_data.order_delievery_phone.value.trim();
        const deilvery_message = form_data.order_delievery_message.value.trim();
        
        const post_name = order_info_agree === false ? "Anonymous" : form_data.order_post_user_name.value.trim();
        const post_email = order_info_agree === false ? "sejunXXXX@naver.com" : form_data.order_post_user_email.value.trim();
        const post_phone = order_info_agree === false ? "010-8XX6-3XX8" : form_data.order_post_user_phone.value.trim();
        
        obj['columns'] = [];
        obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
        obj['columns'].push({ "key" : "order_id", "value" : order_info.id });
        obj['columns'].push({ "key" : "final_price", "value" : cart_final_price });
        obj['columns'].push({ "key" : "get_user_name", "value" : get_user_name });
        obj['columns'].push({ "key" : "get_host_code", "value" : cover_order_host_code });
        obj['columns'].push({ "key" : "get_host", "value" : cover_order_host });
        obj['columns'].push({ "key" : "get_host_detail", "value" : order_host_detail });
        obj['columns'].push({ "key" : "get_phone", "value" : get_user_phone });
        obj['columns'].push({ "key" : "delivery_message", "value" : deilvery_message });
        obj['columns'].push({ "key" : "post_name", "value" : post_name });
        obj['columns'].push({ "key" : "post_email", "value" : post_email });
        obj['columns'].push({ "key" : "post_phone", "value" : post_phone });
        obj['columns'].push({ "key" : "create_date", "value" : null });

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

    _setGoodsStock = async () => {
        const cart_data = JSON.parse(this.props.cart_data);
        const order_info = JSON.parse(this.props.order_info);

        const obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '상품 재고 최신화' };

        obj['columns'] = [];
        obj['where'] = [];
        obj['where_limit'] = 0;

        const set_goods_stock = async () => {
            return await cart_data.forEach( async (el) => {
                const num = order_info.goods_num ? order_info.goods_num : el.num;
                const cover_stock = el.stock ? el.stock : el.goods_stock;
                const stock = (cover_stock - num) < 0 ? 0 : cover_stock - num;

                obj['columns'][0] = { 'key' : 'stock', 'value' : stock };
                obj['where'][0] = { 'key' : 'id', 'value' : el.goods_id }

                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                });
            });
        }

        return await set_goods_stock();
    }

    _orderOptionCheck = async (type) => {
        const { user_info, myPageAction, configAction, use_point, _checkLogin, price_comma, cart_final_price } = this.props;
        const order_info = JSON.parse(this.props.order_info);
        const coupon_select = JSON.parse(this.props.coupon_select);

        let height;

        let get_data;
        let result = true;
        if(type === 'coupon') {
            // 쿠폰 상태 확인하기
            const coupon_obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 상태 확인하기' };
            
            coupon_obj['option'] = {};
            coupon_obj['option']['user_id'] = '=';
            coupon_obj['option']['id'] = '=';
            coupon_obj['option']['code'] = '=';
            coupon_obj['option']['limit_date'] = '>=';
            // coupon_obj['option']['use_order_id'] = 'IS NULL';

            coupon_obj['where'] = [];
            coupon_obj['where'].push({ 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.user_id });
            coupon_obj['where'].push({ 'table' : 'coupon', 'key' : 'id', 'value' : coupon_select.id });
            coupon_obj['where'].push({ 'table' : 'coupon', 'key' : 'code', 'value' : coupon_select.code });
            coupon_obj['where'].push({ 'table' : 'coupon', 'key' : 'limit_date', 'value' : null });
            // coupon_obj['where'].push({ 'table' : 'coupon', 'key' : 'use_order_id', 'value' : null });

            get_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : coupon_obj
            })

            if(get_data.data[0][0] === undefined) {
                alert('쿠폰 정보를 조회할 수 없습니다. \n관리자에게 문의해주세요.');
                result = false;

            } else if(get_data.data[0][0].state !== 0) {
                alert('사용할 수 없는 쿠폰입니다.');
                result = false;
            }

            if(result === false) {
                const coupon_result_obj = {};
                coupon_result_obj['obj'] = JSON.stringify({});
                coupon_result_obj['cover'] = JSON.stringify({});

                height = $('#order_coupon_and_point_div').offset().top;

                $('html').animate({
                    'scrollTop' : height - 100
                }, 300)

                myPageAction.select_coupon(coupon_result_obj);
                this._saveData(order_info, 0, null)
            }

        } else if(type === 'point') {
            const get_data = await _checkLogin();
            configAction.save_user_info({ 'info' : JSON.stringify(get_data) })

            height = $('#order_point_info_div').offset().top;

            if(get_data.point > 1000) {
                if(get_data.point < Number(use_point)) {
                    alert('사용할 수 있는 포인트가 부족합니다. \n(사용 가능 포인트 : ' + price_comma(get_data.point) + ' P )');
                    
                    const price_obj = {};
                    price_obj['use_point'] = 0;
                    price_obj['final_price'] = cart_final_price + use_point;
    
                    $('input[name=use_point_input]').val(0);
                    $('html').animate({
                        'scrollTop' : height - 100
                    }, 300)
                    $('input[name=use_point_input]').focus();

                    myPageAction.save_cart_result_price(price_obj);
                    result = false;
                }

            } else {
                alert('1,000 포인트 이상부터 사용할 수 있습니다.');
                result = false;
            }
        }

        return result;
    }

    // 쿠폰 사용 처리하기
    _useCouponComplate = async () => {
        const { user_info } = this.props;
        const order_info = JSON.parse(this.props.order_info);
        const coupon_select = JSON.parse(this.props.coupon_select);

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

    _removeCart = async () => {
        const cart_data = JSON.parse(this.props.cart_data);
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

    // 주문 처리
    _updateOrder = async (buy_complate) => {
        const order_info = JSON.parse(this.props.order_info);
        const { user_info, payment_select, use_point, cart_coupon_price, cart_final_price } = this.props;

        // order 테이블 state 변경하기
        const update_order = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '주문 상황 상태 업데이트' };

        update_order['where_limit'] = 1;

        let order_type = payment_select === 'bank_pay' ? 1 : 2;
        order_type = buy_complate === true ? 3 : order_type;

        let payment_state = payment_select === 'card' ? 1 : 0;
        payment_state = buy_complate === true ? 1 : payment_state;

        update_order['columns'] = [];
        update_order['columns'][0] = { 'key' : 'order_type', 'value' : order_type };
        update_order['columns'][1] = { 'key' : 'buy_date', 'value' : null };
        update_order['columns'][2] = { 'key' : 'payment_state', 'value' : payment_state };
        update_order['columns'][3] = { 'key' : 'point_price', 'value' : use_point };
        update_order['columns'][4] = { 'key' : 'coupon_price', 'value' : cart_coupon_price };
        update_order['columns'][5] = { 'key' : 'final_price', 'value' : cart_final_price };
        update_order['columns'][6] = { 'key' : 'order_state', 'value' : 1 };

        if(order_type !== 1) {
            update_order['columns'][7] = { 'key' : 'payment_date', 'value' : null } 
        }
        
        update_order['where'] = [];        
        update_order['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
        update_order['where'][1] = { 'key' : 'id', 'value' : order_info.id };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_order
        })
    }

    _checkForm = (form_data) => {
        const { order_host_code, order_host, order_info_agree } = this.props;
        const form_check = { 'bool' : false, 'comment' : '' };

        const obj = {};

        obj["get_user_name"] = order_info_agree === false ? "김세준" : form_data.order_delivery_name.value.trim();
        obj["order_host_code"] = order_info_agree === false ? "14X1X" : order_host_code;
        obj["order_host"] = order_info_agree === false ? "경기 광명시 하안로 XXX" : order_host;
        obj["order_host_detail"] = order_info_agree === false ? "XXX동 XXX호" : form_data.order_delievery_detail_host.value.trim();
        obj["get_user_phone"] = order_info_agree === false ? "010-8XX6-3XX8" : form_data.order_delievery_phone.value.trim();
        obj["deilvery_message"] = form_data.order_delievery_message.value.trim();
        
        obj["post_name"] = order_info_agree === false ? "Anonymous" : form_data.order_post_user_name.value.trim();
        obj["post_email"] = order_info_agree === false ? "sejunXXXX@naver.com" : form_data.order_post_user_email.value.trim();
        obj["post_phone"] = order_info_agree === false ? "010-8XX6-3XX8" : form_data.order_post_user_phone.value.trim();

        form_check['data'] = obj;

        if(order_info_agree) {
            if(obj["get_user_name"] === "") {
                $('input[name=order_delivery_name]').focus();
                form_check['comment'] = '[ 배송지 정보 - 받는이 ] 를 필수로 입력해주세요.';
            
            } else if(!obj["order_host_code"] || !obj["order_host"]) {
                form_check['comment'] = '[ 배송지 정보 - 우편번호 ] 를 선택해주세요.';

                this._toggleModal(true);

                $('html').animate({
                    'scrollTop' : $('input[name=order_delievery_host]').offset().top - 200
                }, 300)

            } else if(obj["order_host_detail"] === "") {
                $('input[name=order_delievery_detail_host]').focus();
                form_check['comment'] = '[ 배송지 정보 - 상세주소 ] 를 입력해주세요.';
            
            } else if(obj["get_user_phone"] === "") { 
                $('input[name=order_delievery_phone]').focus();
                form_check['comment'] = '[ 배송지 정보 - 전화번호 ] 를 입력해주세요.';

            } else if(obj["post_name"] === "") { 
                $('input[name=order_post_user_name]').focus();
                form_check['comment'] = '[ 주문자 정보 - 주문인 ] 을 입력해주세요.';

            } else if(obj["post_email"] === "") {
                $('input[name=order_post_user_email]').focus();
                form_check['comment'] = '[ 주문자 정보 - 이메일 ] 을 입력해주세요.';
            
            } else if(obj["post_phone"] === "") {
                $('input[name=order_post_user_phone]').focus();
                form_check['comment'] = '[ 주문자 정보 - 전화번호 ] 를 입력해주세요.';

            } else {
                form_check['bool'] = true;
            }
        } else {
            form_check['bool'] = true;
        }


        if(form_check['bool'] === false && form_check['comment'] !== "") {
            alert(form_check['comment']);
        }

        return form_check;
    }

    // 유저 정보 저장
    _saveUserInfo = async () => {
        const { order_host_code, order_host, user_info, _checkLogin } = this.props;

        const user_cookie = await _checkLogin();

        if(!user_info.id || !user_cookie.id) {
            alert('유저 정보가 일치하지 않습니다.');
            return window.location.replace('/');
        }

        const user_name = $('input[name=order_delivery_name]').val().trim();
        const detail_host = $('input[name=order_delievery_detail_host]').val().trim();
        const phone = $('input[name=order_delievery_phone]').val().trim();

        if(window.confirm('유저 정보를 저장하시겠습니까?')) {
            if(user_name === "") {
                $('input[name=order_delivery_name]').focus();
                return alert('[ 받는이 ] 를 필수로 입력해주세요.');

            } else if(order_host === null || order_host_code === null) {
                alert('[ 우편번호 및 주소 ] 를 필수로 입력해주세요.');

                this._toggleModal(true);

                $('html').animate({
                    'scrollTop' : $('input[name=order_delievery_host]').offset().top - 200
                }, 300)
                return;

            } else if(detail_host === "") {
                $('input[name=order_delievery_detail_host]').focus();
                return alert('[ 상세주소 ] 를 필수로 입력해주세요.');

            } else if(phone === "") {
                $('input[name=order_delievery_phone]').focus();
                return alert('[ 전화번호 ] 를 필수로 입력해주세요.');
            }

            const obj = { 'type' : 'UPDATE', 'table' : 'userInfo', 'comment' : '유저 정보 수정하기' }

            obj['where_limit'] = 1;

            obj['columns'] = [];

            obj['columns'].push({ 'key' : 'name', 'value' : user_name });
            obj['columns'].push({ 'key' : 'host_code', 'value' : order_host_code });
            obj['columns'].push({ 'key' : 'host', 'value' : order_host });
            obj['columns'].push({ 'key' : 'host_detail', 'value' : detail_host });
            obj['columns'].push({ 'key' : 'phone', 'value' : phone });
            obj['columns'].push({ 'key' : 'modify_date', 'value' : null });

            obj['where'] = [];
            obj['where'][0] = { 'key' : 'user_id', 'value' : user_cookie };
            obj['where'][1] = { 'key' : 'id', 'value' : user_info.id };

            const update_user_info = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
              })

            if(update_user_info.data[0]) {
                alert('정보가 수정되었습니다.');

            } else {
                return alert('정보 수정에 실패했습니다. \n관리자에게 문의해주세요.');
            }

        } else {
            return;
        }
    }

    _mousePaymentSelect = (type, bool, click) => {
        const { payment_select, orderAction } = this.props;

        let title = '';

        // console.log(click)
        if(!click) {
            if(bool === true) {
                if(payment_select !== type) {
                    $('#order_select_' + type + '_title').css({ 'color' : 'black' })

                    if(type === 'bank_pay') {
                        title = "▼　무통장 입금";
                    
                    } else if(type === 'card') {
                        title = "▼　카드 결제";
                    }

                } else {
                    return;
                }

            } else if(bool === false) {
                if(payment_select !== type) {
                    $('#order_select_' + type + '_title').css({ 'color' : '#ababab' })

                    if(type === 'bank_pay') {
                        title = "▽　무통장 입금";
                    
                    } else if(type === 'card') {
                        title = "▽　카드 결제";
                    }

                } else {
                    return;
                }
            }

        } else {
            let cover_type = type;

            if(payment_select === cover_type) {
                cover_type = null;
            } else {

            }

            orderAction.toggle_payment_select({ 'select' : cover_type });

            return;
        }

        // console.log(title)
        $('#order_select_' + type + '_title').text(title);
    }

    _togglePaymentAgree = (type) => {
        const { orderAction, payment_agree, payment_pay_agree } = this.props;
        const obj = {};

        if(type === 'agree') {
            obj[type] = !payment_agree

            if(payment_agree) {
                $('#order_payment_agree_input').prop("checked", false);

            } else {
                $('#order_payment_agree_input').prop("checked", true);
            }

        } else if(type === 'pay_agree') {
            obj[type] = !payment_pay_agree;

            if(payment_pay_agree) {
                $('#order_payment_pay_agree_input').prop("checked", false);

            } else {
                $('#order_payment_pay_agree_input').prop("checked", true);
            }
        }

        return orderAction.toggle_payment_agree(obj);
    }

    render() {
        const { 
            order_loading, price_comma, order_delivery_code_modal, user_info, order_host_code, order_host, cart_coupon_price, _removeCoupon,
            _setModalStyle, coupon_list_open_modal, _toggleCouponListModal, cart_result_price,
            cart_delivery_price, cart_final_price, prediction_point, use_point, _setPonit, user_info_agree_modal, cart_discount_price, payment_select,
            payment_agree, payment_pay_agree, order_same_info_bool, order_ing
        } = this.props;

        const { 
            _toggleModal, _handleComplete, _sameDeliveryInfo, _saveCoverOrderInfo, _agreeSaveUserInfo, _modalUserInfoAgree, 
            _order, _saveUserInfo, _mousePaymentSelect, _togglePaymentAgree
        } = this;

        const order_info = JSON.parse(this.props.order_info);
        const cart_data = JSON.parse(this.props.cart_data);
        const coupon_select = JSON.parse(this.props.coupon_select);

        const default_point = !use_point ? 0 : use_point;

        const cover_host_name = order_same_info_bool && user_info.name ? user_info.name : "";
        const cover_host_email = order_same_info_bool && user_info.email ? user_info.email : "";
        const cover_host_phone = order_same_info_bool && user_info.phone ? user_info.phone : "";

        return(
            order_loading === true ? 

            <div id='order_div' className='default'>
                <div id='order_cart_div' className='order_div_style'>
                    <h3 className='order_title_div'> 주문 리스트 </h3>

                    <div id='order_cart_list_div'>
                        {/* {JSON.stringify(cart_data)} */}
                        {cart_data.map( (el, key) => {
                            const num = order_info.goods_num ? order_info.goods_num : el.num;

                            return(
                                <div className='order_list_divs border_bottom_dotted' key={key}>
                                    <div className='order_list_thumbnail_div' 
                                         style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                    />

                                    <div className='order_list_div '> 
                                        <div className='order_list_goods_name font_14 bold paybook_bold'> { el.goods_name } </div>
                                        <div className='order_list_price_and_num_div font_13 gray marginTop_10'> 
                                            {num} 개　|　
                                            {price_comma((el.price * num))} 원
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* <div id='order_other_price_div' className='marginTop_30'>
                            {order_info.delivery_price > 0 
                                ? <div id='order_delivery_price_div' className='bold order_price_div'>
                                    <div> 배송비　|　</div>
                                    <div> + {price_comma(order_info.delivery_price)} 원 </div>
                                </div>

                                : null
                            }

                            <div id='order_result_price_div' className='order_price_div paybook_bold'>
                                <div> 결제 금액　|　</div>
                                <div id='order_result_price'> {price_comma(order_info.result_price)} 원 </div>
                            </div>
                        </div> */}
                    </div>
                </div>

                <form name='order_delivery_form' onSubmit={_order}>

                <div id='order_delivery_div' className='order_div_style'>
                    <h3 className='order_title_div'> 배송지 정보 </h3>

                    <div id='order_delivery_info_div'>
                        <div className='order_delivery_top_div'> 
                            <div> * 받는이 </div>
                            <div> <input type='input' defaultValue={user_info.name} name='order_delivery_name' maxLength='15' className='order_delivery_input_1'/> </div>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> * 우편번호 </div>
                            <div> 
                                <input type='input' id='order_delivery_host_code_input' value={order_host_code} readOnly disabled /> 
                                <input type='button' value='주소 조회' className='order_delivery_input_1 pointer bold' id='order_delivery_host_code_button'
                                       onClick={() => _toggleModal(true) }
                                />
                            </div>
                        </div>

                        <div id='order_delivery_code_modal' className='display_none'>
                            <Modal
                                isOpen={order_delivery_code_modal}
                                onRequestClose={order_delivery_code_modal ? () => _toggleModal(false) : null}
                                style={_setModalStyle('300px', '320px')}
                            >
                                <h3 className='aCenter'> 우편번호 조회 </h3>
                                <img src={img.icon.close_black} id='close_order_delivery_code' className='pointer' title='닫기' 
                                     onClick={() => _toggleModal(false)} alt=''
                                />

                                <div className='border_top'>
                                    <DaumPostcode
                                        onComplete={_handleComplete}
                                    />
                                </div>
                            </Modal>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> * 주소 </div>
                            <div> <input type='input' name='order_delievery_host' maxLength='50' className='order_delivery_input_2' value={order_host}  readOnly disabled /> </div>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> * 상세 주소 </div>
                            <div> <input type='input' name='order_delievery_detail_host' maxLength='50' className='order_delivery_input_2' defaultValue={user_info.host_detail}  /> </div>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> * 전화번호 </div>
                            <div> <input type='input' name='order_delievery_phone' maxLength='15' className='order_delivery_input_1' defaultValue={user_info.phone}/> </div>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> 배송 메세지 </div>
                            <div> 
                                <input type='input' name='order_delievery_message' maxLength='50' className='order_delivery_input_2' 
                                       placeholder='배송 메세지를 입력해주세요.'
                                /> 
                            </div>
                        </div>

                        <div id='order_save_user_info_div'>
                            <input type='button' value='회원 정보 저장' className='button_style_1' title='입력된 정보를 저장합니다.' 
                                   onClick={_saveUserInfo}
                            />
                        </div>

                        <div id='order_userInfo_agree_div'>
                            <input type='checkbox' id='agree_userInfo_button' name='agree' className='check_custom_1' onClick={_agreeSaveUserInfo} />
                            <span className='check_toggle_1' onClick={() => _agreeSaveUserInfo(true)}> </span>
                            <label htmlFor='agree_userInfo_button' className='pointer font_14 recipe_korea' id='user_info_agree_input'> 
                                개인정보 수집에 동의합니다. 
                            </label>
                            <b className='paybook_bold pointer font_14' onClick={() => this.props.configAction.toggle_agree_modal({ 'bool' : true})}> [ 약관 보기 ] </b>

                            <p id='order_agree_notice_div'> 동의하지 않을 시, 가상정보가 저장됩니다. </p>
                        </div>

                        <Modal
                            isOpen={user_info_agree_modal}
                            onRequestClose={user_info_agree_modal ? () => this.props.configAction.toggle_agree_modal({ 'bool' : false}) : null}
                            style={_setModalStyle('50%', '70%')}
                        >
                            <div id='order_save_user_info_agree_div'>
                                <h4 className='recipe_korea bold aCenter border_bottom_black boredr_width_2'> 개인정보 수집 약관 </h4>
                                <img alt='' src={img.icon.close_black} className='pointer' id='order_save_user_info_close_icon' onClick={() => this.props.configAction.toggle_agree_modal({ 'bool' : false})} />
                            
                                <div id='order_save_user_info_contents_div'>
                                    <div dangerouslySetInnerHTML={ {__html: info_agree} } />
                                </div>

                                <div id='order_save_user_info_agree_button' className='white border bold aCenter recipe_korea pointer'
                                     onClick={_modalUserInfoAgree}
                                > 
                                    동의합니다. 
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>

                <div id='order_post_user_div' className='order_div_style'>
                    <h3 className='order_title_div'> 주문자 정보 </h3>

                    <div id='order_same_delivery_info_div'>
                        <input type='checkbox' id='same_delivery_info_button' name='agree' className='check_custom_1'
                               onClick={() => _sameDeliveryInfo(!order_same_info_bool)} defaultChecked={order_same_info_bool}
                        />
                        <span className='check_toggle_1' onClick={() => _sameDeliveryInfo(!order_same_info_bool)}> </span>
                        <label htmlFor='same_delivery_info_button' className='pointer gray' id='same_delivery_info'> 
                            배송지와 동일합니다.
                        </label>
                    </div>
                    
                    <div className='order_delivery_top_div'> 
                        <div> * 주문인 </div>
                        <div> 
                            <input type='input' name='order_post_user_name' maxLength='15' className='order_delivery_input_1' defaultValue={cover_host_name} 
                                   onChange={() => _saveCoverOrderInfo('name')}
                            /> 
                        </div>
                    </div>

                    <div className='order_delivery_top_div'> 
                        <div> * 이메일 </div>
                        <div> 
                            <input type='input' name='order_post_user_email' maxLength='30' className='order_delivery_input_1' defaultValue={cover_host_email} 
                                   onChange={() => _saveCoverOrderInfo('email')}
                            /> 
                        </div>
                    </div>

                    <div className='order_delivery_top_div'> 
                        <div> * 전화번호 </div>
                        <div> 
                            <input type='input' name='order_post_user_phone' maxLength='15' className='order_delivery_input_1' defaultValue={cover_host_phone} 
                                   onChange={() => _saveCoverOrderInfo('phone')}
                            /> 
                        </div>
                    </div>                    
                </div>


                <div id='order_coupon_and_point_div' className='order_div_style'>
                    <h3 className='order_title_div'> 쿠폰 및 포인트 적립 </h3>

                    <div className='order_delivery_top_div bold'> 
                        <div> 쿠폰 적용 </div>
                        <div> 
                            <input type='button' id='order_coupon_add_button' value='쿠폰 추가' className='white bold pointer font_12' 
                                   onClick={() => _toggleCouponListModal(true)}
                            />
                        </div>
                    </div>

                    {coupon_select.id !== undefined 
                            
                        ? 
                        <div id='cart_coupon_list_div' className='cart_grid_div'>
                            <div>　</div>
                            <div className='gray bold'>
                                <ul>
                                    <li id='cart_coupon_content_list_div' className='bold'> 
                                        <div title={'[' + coupon_select.name + '] 쿠폰 적용 중'}> {coupon_select.name.length > 15 ? coupon_select.name.slice(0, 15) + ' ...' : coupon_select.name} </div> 
                                        <div style={{ 'color' : '#35c5f0'}}> [ {price_comma(cart_coupon_price)} 원 ] </div>
                                        <div>   <img src={img.icon.close_black} id='cart_remove_coupon' className='pointer' title='쿠폰 해제'
                                                     onClick={() => _removeCoupon()} alt=''
                                                />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                            : null}

                    {/* 쿠폰 항목 가져오기 */}
                    <Modal
                        isOpen={coupon_list_open_modal}
                        onRequestClose={coupon_list_open_modal ? () => _toggleCouponListModal(false) : null}
                        style={_setModalStyle('50%', '400px')}
                    >
                        <CouponList 
                            _toggleCouponListModal={_toggleCouponListModal}
                            _addCoupon={this.props._addCoupon}
                            price_comma={price_comma}
                        />
                    </Modal>
                    

                    <div id='order_point_info_div'>
                        <div className='order_delivery_top_div'>
                            <div> 포인트 사용 </div>
                            <div>
                                <input type='number' defaultValue={default_point} max={user_info.point} min={0} name='use_point_input' 
                                       onBlur={_setPonit} readOnly={user_info.point < 1000 ? true : false}
                                       title='1,000 포인트 이상부터 사용할 수 있습니다.' disabled={user_info.point < 1000 ? true : false}
                                /> P
                                <div className='gray'> 보유 포인트 : {price_comma(user_info.point)} P </div>
                            </div>
                        </div>

                        <div className='order_delivery_top_div'> 
                            <div> 포인트 적립 </div>
                            <div style={{ 'color' : '#35c5f0' }}> 
                                {price_comma(prediction_point)} P
                            </div>
                        </div>
                    </div>
                </div>

                <div id='order_bill_div' className='order_div_style'>
                    <h3 className='order_title_div'> 계산서 </h3>
                    
                    <div id='order_bill_list_div'>
                        <div className='order_delivery_top_div'>
                            <div className='order_bill_title_div'> 원　가 </div>
                            <div className='order_bill_contents_div'> {price_comma(order_info.origin_price)} 원 </div>
                        </div>

                        {cart_discount_price > 0 ?
                        <div className='order_delivery_top_div order_bill_option_div'>
                            <div className='order_bill_title_div'> 　└　할인가 </div>
                            <div className='order_bill_contents_div' style={{ 'color' : 'limegreen' }}> - {price_comma(order_info.discount_price)} 원 </div>
                        </div>
                        : null}

                        {cart_delivery_price > 0 ?
                        <div className='order_delivery_top_div'>
                            <div className='order_bill_title_div'> 배송비 </div>
                            <div className='order_bill_contents_div' style={{ 'color' : '#ee9595' }}> + {price_comma(cart_delivery_price)} 원 </div>
                        </div>

                        : null}

                        {cart_coupon_price > 0 || use_point > 0
                            ?   <div id='order_bill_option_div'>
                                    <div className='order_delivery_top_div' id='order_bill_result_div'>
                                        <div className='order_bill_title_div'> 예상 결제가 </div>
                                        <div className='order_bill_contents_div'> {price_comma(cart_result_price)} 원 </div>
                                    </div>

                                    {cart_coupon_price > 0
                                    ?
                                    <div className='order_delivery_top_div order_bill_option_div'>
                                        <div className='order_bill_title_div'> 　└　쿠폰 할인 </div>
                                        <div className='order_bill_contents_div' style={{ 'color' : '#35c5f0' }}> - {price_comma(cart_coupon_price)} 원 </div>
                                    </div>

                                    : null
                                    }

                                    {use_point > 0
                                    ?
                                    <div className='order_delivery_top_div order_bill_option_div'>
                                        <div className='order_bill_title_div'> 　└　포인트 </div>
                                        <div className='order_bill_contents_div' style={{ 'color' : '#35c5f0' }}> - {price_comma(use_point)} 원 </div>
                                    </div>

                                    : null
                                    }
                                </div>

                            : null
                        }

                        {/* <div className='order_delivery_top_div' id='order_final_price_bill'>
                            <div className='order_bill_title_div'> 최종 결제가 </div>
                            <div className='order_bill_contents_div'> {price_comma(final_price)} 원 </div>
                        </div> */}

                        <div id='order_final_price_bill' className='paybook_bold'>
                            <div className='order_bill_title_div'> 최종 결제가 </div>
                            <div className='order_bill_contents_div'> {price_comma(cart_final_price)} 원 </div>
                        </div>
                    </div>                    
                </div>

                <div id='order_payment_div' className='order_div_style'>
                    <h3 className='order_title_div'> 결　제 </h3>
                    
                    { cart_final_price > 0 ? 
                    <div id='order_select_payment_type_div'>
                        <div className='order_select_divs pointer' id='order_select_bank_pay_div'> 
                            <div className='order_select_divs_title bold' id='order_select_bank_pay_title'
                                 onMouseOver={() => _mousePaymentSelect('bank_pay', true)}
                                 onMouseLeave={() => _mousePaymentSelect('bank_pay', false)}
                                 onClick={() => _mousePaymentSelect('bank_pay', null, true)}
                                 style={payment_select === 'bank_pay' ? { 'color' : '#00587a' } : null }
                            > 
                                {payment_select === 'bank_pay' ? '▲　무통장 입금' : '▽　무통장 입금' } 
                            </div>

                            {payment_select === 'bank_pay' 
                            ? 
                            <div className='order_select_contnets_div' id='order_select_bank_pay_contents_div'>
                            </div>

                            : null}
                        </div>

                        <div className='order_select_divs pointer' id='order_select_card_div'> 
                            <div className='order_select_divs_title bold' id='order_select_card_title'
                                 onMouseOver={() => _mousePaymentSelect('card', true)}
                                 onMouseLeave={() => _mousePaymentSelect('card', false)}
                                 onClick={() => _mousePaymentSelect('card', null, true)}
                                 style={payment_select === 'card' ? { 'color' : '#00587a' } : null }
                            > 
                                {payment_select === 'card' ? '▲　카드 결제' : '▽　카드 결제' }
                            </div>

                            {payment_select === 'card' 
                            ?
                            <div className='order_select_contnets_div' id='order_select_bank_pay_contents_div'>
                            </div>

                            : null}
                        </div>
                    </div>
                    : null}

                    <div id='order_payment_agree_div'>
                        <div> 
                            <input type='checkbox' id='order_payment_agree_input' name='agree' className='check_custom_1'
                                onClick={() => _togglePaymentAgree('agree')}
                            />
                            <span className='check_toggle_1' onClick={() => _togglePaymentAgree('agree')}> </span>
                            <label htmlFor='order_payment_agree_input' className='pointer gray' id='order_payment_agree_title'
                                  style={payment_agree ? { 'color' : '#35c5f0', 'fontWeight' : 'bold' } : null}
                            >
                                ㆍ 구매조건 확인 및 이용약관, 결제진행에 동의합니다.
                            </label>
                        </div>

                        <div> 
                            <input type='checkbox' id='order_payment_pay_agree_input' name='agree' className='check_custom_1'
                                onClick={() => _togglePaymentAgree('pay_agree')}
                            />
                            <span className='check_toggle_1' onClick={() => _togglePaymentAgree('pay_agree')}> </span>
                            <label htmlFor='order_payment_pay_agree_input' className='pointer gray' id='order_payment_pay_agree_title'
                                  style={payment_pay_agree ? { 'color' : '#35c5f0', 'fontWeight' : 'bold' } : null}
                            > 
                                ㆍ 위 결제는 실제 비용이 결제되지 않는 테스트임을 확인합니다.
                            </label>
                        </div>
                    </div>

                </div>

                <div id='order_payment_final_button' className='border_top_black border_width_2 aCenter'>
                    <input type='submit' value='주문 신청' className='paybook_bold pointer bold' />
                </div>

                </form>

                <Modal
                    isOpen={order_ing}
                    style={_setModalStyle('300px', '320px')}
                >
                    <h4 className='aCenter paybook_bold'> 결제 진행 중 </h4>
                </Modal>

            </div>

            : null
        )
    }
}

Order.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        order_info : state.order.order_info,
        cart_data : state.order.cart_data,
        order_loading : state.order.order_loading,
        order_delivery_code_modal : state.order.order_delivery_code_modal,
        order_info_agree : state.order.order_info_agree,
        order_host_code : state.order.order_host_code,
        order_host : state.order.order_host,
        order_same_info_bool : state.order.order_same_info_bool,
        cover_order_name : state.order.cover_order_name,
        cover_order_email : state.order.cover_order_email,
        cover_order_phone : state.order.cover_order_phone,
        cart_coupon_price : state.my_page.cart_coupon_price,
        coupon_select : state.my_page.coupon_select,
        cart_discount_price : state.my_page.cart_discount_price,
        cart_delivery_price : state.my_page.cart_delivery_price,
        cart_result_price : state.my_page.cart_result_price,
        cart_final_price : state.my_page.cart_final_price,
        prediction_point : state.my_page.prediction_point,
        use_point : state.my_page.use_point,
        user_info_agree_modal : state.config.user_info_agree_modal,
        cart_discount_price : state.my_page.cart_discount_price,
        payment_select : state.order.payment_select,
        payment_agree : state.order.payment_agree,
        payment_pay_agree : state.order.payment_pay_agree,
        order_ing : state.order.order_ing,
        buy_order_info : state.order.buy_order_info
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch),
    })
  )(Order);