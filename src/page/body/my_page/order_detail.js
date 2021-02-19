import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';
import * as orderAction from '../../../Store/modules/order';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import $ from 'jquery';
import URL from '../../../config/url';
import Modal from 'react-modal';
import icon from '../../../source/img/icon.json'

let order_payment_bool = false;
let order_complate_bool = false;
class OrderDetail extends Component {

    async componentDidMount() {
        const { _checkLogin, match } = this.props;
        // 접근 가능 확인하기
        const user_check = await _checkLogin();

        if(!user_check.id) {
            alert('접근 할 수 없습니다.');
            return window.location.replace('/');
        }

        // 접근된 order_id 가져오기
        const order_id = match.params.id

        // const order_id = JSON.parse(await _stringCrypt(url_order_id, String(user_check.id), false));
        if(!order_id) {
            alert('접근 권한이 없습니다.');
            return window.location.replace('/');
        }

        if(user_check.id && Number(order_id) > 0) {
            // 상세 정보 가져오기
            await this._getOrderDetailInfo(user_check.id, order_id);

        } else {
            alert('데이터를 조회할 수 없습니다.');
            return window.location.replace('/');
        }
    }

    _getOrderDetailInfo = async (user_id, cover_order_id) => {
        user_id = !user_id ? this.props.user_info.id : user_id

        const { orderAction } = this.props;
        const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '주문 정보 가져오기' };

        obj['table'] = 'order_info'
        obj['join'] = true;
        obj['join_table'] = 'order';

        obj['join_arr'] = [];
        obj['join_arr'].push({ 'key1' : 'id', 'key2' : 'order_id' })

        obj['join_where'] = '*';

        obj['option'] = {};
        obj['option']['order_id'] = '=';
        obj['option']['user_id'] = '=';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'order_info', 'key' : 'order_id', 'value' : Number(cover_order_id) });
        obj['where'].push({ 'table' : 'order_info', 'key' : 'user_id', 'value' : user_id });

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
        const detail_info = get_data.data[0][0];

        let data = null;
        if(detail_info && detail_info.cart_list !== undefined) {
            data = JSON.parse(detail_info.cart_list);

        } else {
            alert('상품 데이터를 조회할 수 없습니다.');
            return window.location.replace('/myPage/order_list');
        }

        if(data) {
            await this._getCartData(data, cover_order_id);

            orderAction.save_order_info({ 'order_list_info' : JSON.stringify(detail_info), 'loading' : true });
            return detail_info;

        } else {
            alert('상품 데이터 조회에 오류가 발생했습니다.');
            return window.location.replace('/myPage/order_list');
        }

    }

    // 상품 데이터 조회하기
    _getCartData = async (list, order_id) => {
        const { orderAction, user_info } = this.props;

        const get_cart_data = async (cart_list, length, arr, bool) => {
            if(cart_list.length === length) {
                return arr;
            }

            const obj = { 'type' : 'SELECT', 'table' : 'cart', 'comment' : '상품 리스트 정보 가져오기' };

            obj['option'] = {};
            obj['option']['id'] = '=';

            obj['where'] = [];
            obj['join_arr'] = [];
            obj['join_where'] = [];

            if(bool === true) {
                obj['join'] = true;
                obj['join_table'] = 'goods';

                obj['join_arr'].push({ 'key1' : 'id', 'key2' : 'goods_id' })

                obj['join_where'].push({ 'columns' : 'thumbnail', 'as' : 'goods_thumbnail' })
                obj['join_where'].push({ 'columns' : 'name', 'as' : 'goods_name' })

                obj['option']['user_id'] = '=';
                
                obj['where'].push({ 'table' : 'cart', 'key' : 'id', 'value' : cart_list[length] });
                obj['where'].push({ 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id });

            } else if(bool === false) {
                obj['table'] = 'goods';
                
                obj['where'].push({ 'table' : 'goods', 'key' : 'id', 'value' : cart_list[length] });
            }

            let data_get = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })
            data_get = data_get.data[0][0];

            // 리뷰 정보 가져오기
            const get_review_info = { 'type' : 'SELECT', 'table' : 'review', 'comment' : '리뷰 정보 가져오기' };

            get_review_info['where'] = [];
            get_review_info['option'] = {};

            get_review_info['option']['user_id'] = '=';
            get_review_info['where'].push({ 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id });

            get_review_info['option']['goods_id'] = '=';
            get_review_info['where'].push({ 'table' : 'review', 'key' : 'goods_id', 'value' : data_get.goods_id ? data_get.goods_id : data_get.id });

            get_review_info['option']['order_id'] = '=';
            get_review_info['where'].push({ 'table' : 'review', 'key' : 'order_id', 'value' : order_id });

            let review_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : get_review_info
            })
            
            review_data = review_data.data[0][0];
            if(review_data && review_data.id) {
                data_get['review_id'] = review_data.id;
                data_get['review_date'] = review_data.create_date;
                data_get['review_title'] = review_data.title;
                data_get['review_contents'] = review_data.contents;
                data_get['review_remove_date'] = review_data.remove_date;
                data_get['review_score'] = review_data.score;
            }

            ///////////////////////////////////////////////////////////////////////////////////////////////////

            arr.push(data_get)
            if(!data_get) {
                alert('오류 발생 : 데이터를 불러올 수 없습니다.');

                return window.location.replace('/');
            }

            return await get_cart_data(cart_list, length + 1, arr, bool)
        }

        const bool = typeof list === 'object' ? true : false;
        if(bool === false) {
            list = [list];
        }

        const result_cart_data = await get_cart_data(list, 0, [], bool);
        orderAction.save_order_info({ 'cart_data' : JSON.stringify(result_cart_data) });
    }

    // 입금 처리
    _orderPayment = async (order_id) => {
        const order_info = JSON.parse(this.props.order_list_info);
        const { _setPoint, user_info, _setGoodsStock, start_date, orderAction } = this.props;

        if(order_payment_bool === false) {
            order_payment_bool = true;

            const get_order_data = await this._getOrderDetailInfo(user_info.id, order_info.id, start_date);

            if(get_order_data.payment_state !== 0) {
                alert('결제 현황이 "미입금" 상태에서만 가능합니다.');
                order_payment_bool = false;
            
            } else if(get_order_data.order_state !== 1) {
                alert('주문 확정이 되지 않는 주문만 가능합니다.');
                order_payment_bool = false;
            }

            orderAction.toggle_cancel_modal({ 'cancel' : true });

            // 포인트 적립하기
            const prediction_point = Math.trunc((order_info.origin_price - order_info.discount_price) * 0.01);
            if(prediction_point > 0) {
                // const user_point = user_info.point + prediction_point;
                const point_comment = order_id + ' 번 주문 구매로 인한 포인트 적립 ( ' + prediction_point + ' P )';

                await _setPoint(prediction_point, 'add', point_comment, user_info.id);
            }

            // cart_data 구하기
            // const cart_data = await this._setCartData();
            await _setGoodsStock(order_info, 'remove');

            // order 업데이트
            const obj = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '입금 완료' }

            obj['columns'] = [];
            obj['columns'].push({ 'key' : 'payment_state', 'value' : 1 });
            obj['columns'].push({ 'key' : 'delivery_state', 'value' : 1 });
            obj['columns'].push({ 'key' : 'payment_date', 'value' : null });
    
            obj['where'] = [];
            obj['where'].push({ 'key' : 'user_id', 'value' : user_info.id });
            obj['where'].push({ 'key' : 'id', 'value' : order_id });

            obj['where_limit'] = 1;

            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            alert('입금 처리가 완료되었습니다.');
            return window.location.reload();
        }
    }

    // 주문 확정
    _orderComplate = async (order_id) => {
        if(order_complate_bool === false) {
            if(window.confirm('주문을 확정하시겠습니까? \n주문 확정 후에는 취소 및 환불이 불가능합니다.')) {
                const { orderAction } = this.props;
                order_complate_bool = true;

                orderAction.toggle_cancel_modal({ 'cancel' : true });

                const { user_info, start_date } = this.props;
                const obj = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '주문 확정하기' }
                const order_info = JSON.parse(this.props.order_list_info);

                const get_order_data = await this._getOrderDetailInfo(user_info.id, order_info.id, start_date);

                if(get_order_data.order_state !== 1 || get_order_data.payment_state !== 1 || get_order_data.delivery_state === 0) {
                    alert('결제 현황이 "결제 완료" 상태가 아닙니다.');
                    return window.location.reload();
                }

                obj['columns'] = [];
                obj['columns'].push({ 'key' : 'order_state', 'value' : 2 });
                obj['columns'].push({ 'key' : 'order_complate_date', 'value' : null });
        
                obj['where'] = [];
                obj['where'].push({ 'key' : 'user_id', 'value' : user_info.id });
                obj['where'].push({ 'key' : 'id', 'value' : order_id });

                obj['where_limit'] = 1;


                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                alert('구매 확정이 완료되었습니다.');
                return window.location.reload();
            }
        }
    }

    // 구매 취소
    _orderCancel = async (event) => {
        const { orderAction, order_canceling } = this.props;
        event.preventDefault();

        if(order_canceling === true) {
            return;
        }

        const order_info = JSON.parse(this.props.order_list_info);
        if(order_info.order_state === 3) {
            alert('이미 취소 처리된 주문입니다.');
            return window.location.reload();
            
        } else if(order_info.order_state !== 1) {
            alert('주문 상태가 "주문 완료" 상태가 아닙니다.');
            return window.location.reload();
        }

        const form_data = event.target;
        let select_val = form_data.order_cancel_reason.value;

        if(select_val === 'custom') {
            select_val = form_data.custom_cancel_reason.value.trim();

            if(select_val.length === 0) {
                $('input[name=custom_cancel_reason]').val("");
                $('input[name=custom_cancel_reason]').focus();

                return alert('취소 사유를 입력해주세요.');
            }
        }

        if(window.confirm('해당 주문을 정말 취소하시겠습니까?')) {
            let cancel_ment = '해당 주문이 취소되었습니다. \n\n';

            $('#order_cancel_icon').fadeOut(400);
            $('#order_cancel_submit').css({ 'backgroundColor' : '#ababab' })
            orderAction.toggle_cancel_modal({ 'cancel' : true });

            const { user_info, _setGoodsStock, _setPoint } = this.props;

                // 적립금 회수하기
                const prediction_point = Math.trunc((order_info.origin_price - order_info.discount_price) * 0.01);
                // let user_point = user_info.point;
                let point_comment = "";

                const order_id = order_info.id;

                // 적립 포인트 회수하기
                if(order_info.payment_state === 1) {
                    if(prediction_point > 0) {
                        point_comment = order_id + ' 번 주문 취소로 인한 적립 포인트 회수 ( -' + prediction_point + ' P )';
                        // user_point = user_point - prediction_point;

                        cancel_ment += '적립 포인트 회수 : - ' + prediction_point + ' \n';
                        await _setPoint(prediction_point, 'remove', point_comment, user_info.id);
                    }
                }

                // 사용 포인트 반환하기
                if(order_info.point_price > 0) {
                    point_comment = order_id + ' 번 주문 취소로 인한 사용 포인트 반환 ( ' + order_info.point_price + ' P )';
                    // user_point = user_point + order_info.point_price;

                    cancel_ment += '사용 포인트 반환 : + ' + order_info.point_price + ' \n';
                    await _setPoint(order_info.point_price, 'add', point_comment, user_info.id);
                }

                // 사용 쿠폰 반환하기
                if(order_info.coupon_id && order_info.coupon_price > 0) {
                    const search_coupon = { 'type' : 'UPDATE', 'table' : 'coupon', 'comment' : '쿠폰 반환하기' };

                    search_coupon['columns'] = [];
                    search_coupon['columns'].push({ 'key' : 'state', 'value' : 0 });
                    search_coupon['columns'].push({ 'key' : 'cancel_date', 'value' : null });
            
                    search_coupon['where'] = [];
                    search_coupon['where'].push({ 'key' : 'user_id', 'value' : user_info.user_id });
                    search_coupon['where'].push({ 'key' : 'id', 'value' : order_id.coupon_id });
        
                    search_coupon['where_limit'] = 1;
                    
                    await axios(URL + '/api/query', {
                        method : 'POST',
                        headers: new Headers(),
                        data : search_coupon
                    })
                }

                await _setGoodsStock(order_info, 'add');

                // 주문 상태 변경하기
                const order_obj = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '주문 취소 상태로 업데이트' }

                order_obj['columns'] = [];
                order_obj['columns'].push({ 'key' : 'order_state', 'value' : 3 });
                order_obj['columns'].push({ 'key' : 'delivery_state', 'value' : 0 });
                order_obj['columns'].push({ 'key' : 'cancel_reason', 'value' : select_val });
                order_obj['columns'].push({ 'key' : 'cancel_date', 'value' : null });
        
                order_obj['where'] = [];
                order_obj['where'].push({ 'key' : 'user_id', 'value' : user_info.id });
                order_obj['where'].push({ 'key' : 'id', 'value' : order_id });

                order_obj['where_limit'] = 1;

                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : order_obj
                })

            alert(cancel_ment);
            return window.location.reload();
        }
    }

    // 취소 사유 - 직접 기입 선택시
    _selectCancelReason = (event) => {
        const target = event.target.value;

        if(target === 'custom') {
            $('#custom_cancel_reason_input').css({ 'display' : 'block' })
            $('input[name=custom_cancel_reason]').focus();

        } else {
            $('#custom_cancel_reason_input').css({ 'display' : 'none' })
        }
    }

    // 직접 기입 Input 선택시 자동으로 Select Tag click 이벤트 발생
    _selectClickEvent = () => {
        $('#order_cancel_reason_select').val('custom').trigger('click');
    }

    _openReviewModal = (goods_id, order_id, start_date) => {
        const { configAction, orderAction } = this.props;
        const { _getOrderDetailInfo } = this;

        const obj = {};
            obj['bool'] = true
            obj['goods_id'] = goods_id
            obj['order_id'] = order_id
            obj['callback'] = _getOrderDetailInfo

        configAction.toggle_review_modal(obj);
        orderAction.set_date({ 'start_date' : start_date });
    }

    _orderListRemoveReview = async (review_id, qry, order_id, goods_id, score) => {
        const { _removeReview } = this.props;
        const { _getOrderDetailInfo } = this;

        const start_date = qry.start_date ? Date.parse(qry.start_date) : Date.parse(this.props.start_date);
        
        const remove_review = await _removeReview(review_id, goods_id, score, null, true);

        if(remove_review === true) {
            await _getOrderDetailInfo(start_date, order_id);

            return alert('리뷰가 삭제되었습니다.');
        }
    }

    render() {
        const { 
            order_loading, price_comma, order_detail_bool, order_cancel_modal, order_canceling, _setModalStyle, location
        } = this.props;

        const {
            _orderPayment, _orderComplate, _orderCancel, _selectCancelReason, _selectClickEvent, _openReviewModal, _orderListRemoveReview
        } = this;

        const qry = queryString.parse(location.search);
        const start_date = Date.parse(this.props.start_date);

        const order_info = JSON.parse(this.props.order_list_info);

        let payment_state = '미입금';
        let delivery_state = '-';

        let payment_type = '무통장 입금';
        let bank_ment = '[ 농협 - X ] 로 입금해주세요.';

        // if(order_detail_bool === true) {
            if(order_info.payment_state === 1) {
                payment_state = '결제 완료'
                bank_ment = '';
            }

            if(order_info.order_type === 2) {
                payment_type = '카드 결제';
                bank_ment = '';

            } else if(order_info.order_type === 3) {
                payment_type = '포인트 & 쿠폰 결제';
                bank_ment = '';
            }

            if(order_info.delivery_state === 1) {
                delivery_state = '배송 준비중';
            }
        // }

        const cart_data = JSON.parse(this.props.cart_data);
        let order_complate = "";
        let order_color = "#ababab";

        if(order_info.payment_state === 1) {
            order_color = 'black';
        }

        if(order_info.order_state === 2) {
            order_complate = '( 구매 확정 )';
            order_color = '#35c5f0';

        } else if(order_info.order_state === 3) {
            order_complate = "( 주문 취소 )";
            order_color = '#eb596e';
            bank_ment = '';
        }

        const star_arr = [1, 2, 3, 4, 5];

        const referrer = sessionStorage.getItem('back');

        return (
            <div>
                {order_loading === true 
                ?

                <div id='order_list_detail_info_div'>
                    <div className='order_list_back_move_div pointer paybook_bold'>
                        <div onClick={() => window.location.href = referrer ? referrer : '/myPage/order_list'}> ◀　뒤로 가기 </div>
                    </div>

                    <div id='order_list_contents_info_div'>
                                <div className='order_list_detail_info_div'>
                                    <h3 className='order_title_div'> 주문 정보 </h3>

                                    <div className='order_list_contents'>
                                        <div className='order_complate_num_div'>
                                            <div> 주문 번호　|　{order_info.order_id} </div>
                                            <div> 주문 일자　|　{order_info.buy_date} </div>
                                        </div>

                                        <div className='order_complate_num_div'>
                                            <div> 결제 방식　|　{payment_type} {bank_ment !== '' ? <p className='order_list_bank_ment'> {bank_ment} </p> : null} </div>
                                            <div> 결제 현황　|　
                                                <b style={{ 'color' : order_color }}>
                                                    {payment_state} {order_complate} 
                                                </b>
                                            </div>
                                        </div>

                                        <div className='order_complate_num_div'>
                                            <div> 배송 현황　|　{delivery_state} </div>
                                            {order_info.order_type === 1 && order_info.payment_state === 1
                                                ? <div> 입금 일자　|　{order_info.payment_date} </div>
                                                : null
                                            }
                                        </div>

                                        <div id='order_list_other_function_div'>
                                            {order_info.order_state === 1 && (order_info.delivery_state === 0 || order_info.delivery_state === 1)
                                                ? <div> <u onClick={() => this.props.orderAction.toggle_cancel_modal({ 'bool' : true })}> 주문 취소 </u> </div>
                                                : null}

                                            {order_info.order_state === 1 && order_info.payment_state === 0
                                                ? <div> <u onClick={() => _orderPayment(order_info.id)}> 입금 완료 </u> </div>
                                                : null}

                                            {order_info.order_state === 1 && order_info.payment_state === 1 
                                                ? <div> <u onClick={() => _orderComplate(order_info.id)}> 주문 확정 </u> </div>
                                                : null}
                                        </div>

                                        {/* 주문 취소 Modal */}
                                        <Modal
                                            isOpen={order_cancel_modal}
                                            onRequestClose={order_canceling === false ? () => this.props.orderAction.toggle_cancel_modal({ 'bool' : false }) : null}
                                            style={_setModalStyle('300px', '320px')}
                                        >
                                            <h4 id='order_cancel_title' className='aCenter'> 주문 취소 </h4>
                                            <img src={icon.icon.close_black} id='order_cancel_icon' className='pointer' title='닫기' alt=''
                                                    onClick={() => order_canceling === false ? this.props.orderAction.toggle_cancel_modal({ 'bool' : false }) : null} />
                                        
                                            <form name='order_cancel_form' onSubmit={_orderCancel}>
                                                <div id='order_cancel_contents_div'>
                                                    <b className='select_color font_14 recipe_korea'> 주문 취소 사유 </b>
                                                    <select name='order_cancel_reason' className='pointer' onChange={_selectCancelReason}
                                                            id='order_cancel_reason_select'
                                                    >
                                                        <option value='원하는 상품이 없음'> 원하는 상품이 없음 </option>
                                                        <option value='다른 상품으로 다시 주문'> 다른 상품으로 다시 주문 </option>
                                                        <option value='구매할 의사가 없음'> 구매할 의사가 없음 </option>
                                                        <option value='custom'> 직접 기입 </option>
                                                    </select>

                                                    <input type='text' maxLength='30' name='custom_cancel_reason' id='custom_cancel_reason_input'
                                                           placeholder='취소 사유를 직접 입력해주세요.' onClick={_selectClickEvent} autoComplete='off'
                                                    />

                                                    <input type='submit' value='주문 취소' id='order_cancel_submit' className='button_style_1' />
                                                </div>
                                            </form>
                                        </Modal>

                                        <div id='order_list_state_reason_div'>
                                            {order_info.order_state === 2
                                                ? <div> <b> 확정 일자　|　{order_info.order_complate_date} </b> </div>
                                                : null
                                            }

                                            {order_info.order_state === 3
                                                ? <div>
                                                    <div> <b> 취소 일자　|　{order_info.cancel_date} </b> </div>
                                                    <div> <b> 취소 사유　|　{order_info.cancel_reason} </b> </div>
                                                  </div>
                                                : null
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className='order_list_detail_info_div'>
                                    <h3 className='order_title_div'> 상품 및 결제 정보 </h3>

                                    <div id='order_list_goods_and_price_div'>
                                        <div id='order_list_goods_list_div'>
                                            {cart_data.map( (el, key) => {
                                                const thumbnail = el.thumbnail ? el.thumbnail : el.goods_thumbnail;
                                                const name = el.name ? el.name : el.goods_name;
                                                const num = el.num ? el.num : order_info.goods_num;

                                                const price = el.price ? el.price : order_info.origin_price - order_info.discount_price;
                                                const goods_id = el.goods_id ? el.goods_id : el.id;

                                                return(
                                                    <div key={key}>
                                                        <div className='order_list_goods_div'
                                                            style={cart_data.length !== (key + 1) ? { 'borderBottom' : 'dotted 1px #ababab' } : null}
                                                        >
                                                            <div style={{ 'backgroundImage' : `url(${thumbnail})` }} className='order_list_goods_thumbnail_div pointer'
                                                                onClick={() => window.location.href='/goods/?goods_num=' + goods_id}
                                                                
                                                            />
                                                            <div className='order_list_goods_contents_div'>
                                                                <div className='order_list_goods_name_div cut_multi_line'> <b className='paybook_bold'> {name} </b> </div>
                                                                <div className='order_list_num_and_price font_13'> 
                                                                    {price_comma(price)} 원　|　{num} 개
                                                                    
                                                                    {order_info.order_state === 2 && el.review_id === undefined
                                                                    ? <p className='aRight'> 
                                                                        <input type='button' value='리뷰 작성' className='goods_write_button white pointer' 
                                                                            onClick={() => _openReviewModal(goods_id, order_info.order_id, start_date)}
                                                                        /> 
                                                                    </p>
                                                                    
                                                                    : null}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {el.review_id && el.review_id !== null
                                                            ? 
                                                            <div>
                                                                {el.review_remove_date && el.review_remove_date !== null
                                                                    ? <div className='order_list_review_remove_complate_div font_13 grid_half'>
                                                                        <div className='bold red'> ▼ 삭제된 리뷰입니다. </div>
                                                                        <div className='gray aRight'> 삭제 일자　|　{el.review_remove_date.slice(0, 16)} </div>
                                                                      </div>

                                                                    : null
                                                                }

                                                                <div className='order_list_review_info_div'>
                                                                    <div className='order_list_star_and_date_div font_12 grid_half'>
                                                                        <div className='order_list_star_div'>
                                                                            <div> 별점　|　</div>
                                                                            {star_arr.map( (cu) => {
                                                                                const star = Number(cu) <= Number(el.review_score) ? '★' : '☆';

                                                                                return(
                                                                                    <div key={cu}
                                                                                        style={ Number(cu) <= Number(el.review_score) ? { 'color' : 'rgb(253, 184, 39)' } : null } 
                                                                                    >
                                                                                        {star}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                        <div className='order_list_review_date_div aRight'> 리뷰 작성일　|　{el.review_date.slice(0, 16)} </div>
                                                                    </div>

                                                                    <div className='order_list_review_title_and_contents_div'>
                                                                        <div className='order_list_review_title_div'>
                                                                            <div className='order_list_review_title_other_div'> 제목 </div>
                                                                            <div className='order_list_reivew_title_info_div' dangerouslySetInnerHTML={ { __html : el.review_title }} />
                                                                        </div> 
                                                                        <div className='order_list_review_contents_div' dangerouslySetInnerHTML={ { __html : el.review_contents }}  /> 
                                                                    </div>
                                                                </div>

                                                                {el.review_remove_date === null
                                                                ?
                                                                    <div className='order_list_review_remove_div aRight'
                                                                        style={ cart_data.length > (key + 1) ? { 'borderBottom' : 'dotted 1px #ababab' } : null }
                                                                    >
                                                                        <input type='button' className='pointer' value='리뷰 삭제'
                                                                            onClick={() => _orderListRemoveReview(el.review_id, qry, order_info.id, goods_id, el.review_score)}
                                                                        />
                                                                    </div>

                                                                    : null
                                                                }
                                                            </div>
                                                            : null
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div id='order_list_price_info_div'>
                                            <div className='order_list_price_info_divs'>
                                                <div className='order_list_price_title_div'> 상품 가격 </div>
                                                <div className='order_list_price_contents_div'> {price_comma(order_info.origin_price - order_info.discount_price)} 원 </div>
                                            </div>

                                            <div className='order_list_price_info_divs'>
                                                <div className='order_list_price_title_div'> 배송비 </div>
                                                <div className='order_list_price_contents_div'> + {price_comma(order_info.delivery_price)} 원 </div>
                                            </div>

                                            <div className='order_list_price_info_divs bold' 
                                                style={order_info.coupon_price + order_info.point_price > 0 ? { 'color' : '#35c5f0' } : { 'color' : '#ababab' } }
                                            >
                                                <div className='order_list_price_title_div'> 할인가 </div>
                                                <div className='order_list_price_contents_div' id='order_list_discount_grid_div'>
                                                    <div className='aRight'>
                                                        - {price_comma(order_info.coupon_price + order_info.point_price)} 원
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='order_list_price_info_divs bold' style={{ 'backgroundColor' : 'black', 'color' : 'white' }}>
                                                <div className='order_list_price_title_div'> 최종 결제가 </div>
                                                <div className='order_list_price_contents_div'> {price_comma(order_info.final_price)} 원 </div>
                                            </div>

                                            <div id='order_list_point_and_coupon_info'>
                                                <div className='order_complate_num_div bold'>
                                                    <div className={order_info.point_price > 0 ? null : 'gray'}> 
                                                        사용 포인트　|　- {order_info.point_price > 0 ? price_comma(order_info.point_price) + ' P' : null} 
                                                    </div>

                                                    <div className={Math.trunc((order_info.origin_price - order_info.discount_price) * 0.01) > 0 ? 'aRight' : 'aRight gray' }> 
                                                        적립 포인트　|　
                                                        <b style={ Math.trunc((order_info.origin_price - order_info.discount_price) * 0.01) > 0 ? { 'color' : '#35c5f0' } : null}>
                                                            {price_comma( Math.trunc((order_info.origin_price - order_info.discount_price) * 0.01)) } P 
                                                        </b>
                                                    </div>
                                                </div>

                                                <div id='order_list_coupon_price_div' className={order_info.coupon_price > 0 ? 'bold' : 'bold gray'}>
                                                쿠폰 할인가　|　- {order_info.coupon_price > 0 ? price_comma(order_info.coupon_price) + ' 원' : null}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className='order_list_detail_info_div'>
                                    <h3 className='order_title_div'> 배송지 정보 </h3>

                                    <div className='order_list_contents'>
                                        <div className='order_complate_num_div'>
                                            <div> 수령인　|　{order_info.get_user_name} </div>
                                            <div> 연락처　|　{order_info.get_phone} </div>
                                        </div>
                                        
                                        <div> 배송지　|　[ {order_info.get_host_code} ] </div>
                                        <div> 　　　　　{order_info.get_host} </div>
                                        <div> 　　　　　{order_info.get_host_detail} </div>

                                        {order_info.delivery_message !== ""
                                        ? <div> 메세지　|　{order_info.delivery_message} </div>
                                        : null}
                                    </div>

                                </div>

                                <div className='order_list_detail_info_div'>
                                    <h3 className='order_title_div'> 주문자 정보 </h3>

                                    <div className='order_list_contents'>
                                        <div> 주문인　|　{order_info.post_name} </div>
                                        <div> 이메일　|　{order_info.post_email} </div>
                                        <div> 연락처　|　{order_info.post_phone} </div>
                                    </div>
                                </div>
                            </div>

                            <div className='order_list_back_move_div pointer paybook_bold marginTop_40'
                                //  onClick={() => _selectDetail(null, true)}
                            >
                                <div onClick={() => window.location.href = referrer ? referrer : '/myPage/order_list'}> ◀　뒤로 가기 </div>
                            </div>
                </div>

                : 
                    <div id='order_detail_loading_div'>
                        <h4 className='aCenter marginTop_40'> 데이터를 조회하고 있습니다. </h4>
                    </div>
                }
            </div>
        )
    }
}

OrderDetail.defaultProps = {
    // coupon_loading : false
  }
  
  export default connect(
    (state) => ({
        order_info : state.order.order_info,
        now_date : state.config.now_date,
        start_date : state.order.start_date,
        end_date : state.order.end_date,
        start_select_num : state.order.start_select_num,
        order_loading : state.order.order_loading,
        order_detail_select : state.order.order_detail_select,
        order_detail_bool : state.order.order_detail_bool,
        cart_data : state.order.cart_data,
        order_cancel_modal : state.order.order_cancel_modal,
        order_canceling : state.order.order_canceling,
        paging_cnt : state.config.paging_cnt,
        paging_show : state.config.paging_show,
        now_page : state.config.now_page,
        order_list_info : state.order.order_list_info
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch),
    })
  )(OrderDetail);