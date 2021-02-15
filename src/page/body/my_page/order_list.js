import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import DatePicker from "react-datepicker";
import { ko } from "date-fns/esm/locale";
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as goodsAction from '../../../Store/modules/goods';
import * as myPageAction from '../../../Store/modules/my_page';
import * as orderAction from '../../../Store/modules/order';

import Paging from '../../config/paging';

import "react-datepicker/dist/react-datepicker.css";
import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

// import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';
import icon from '../../../source/img/icon.json';

let order_complate_bool = false;
let order_payment_bool = false;

class OrderList extends Component {

    async componentDidMount() {
        const { location, orderAction, _getCookie, _hashString, user_info, _moveScrollbar } = this.props;
        const moment = require('moment');

        // history.pushState(null, null, location.href);
        // if(window.presisted || (window.performance && window.performance.navigation.type === 2)) {
        //     alert(11)
        // }

        let get_order_id = await _getCookie(_hashString('detail_order_id'), 'get');
        const session_info = JSON.parse(sessionStorage.getItem(_hashString('detail_order_id')));

        if(get_order_id !== false && session_info !== null) {
            // 상세 정보 쿠키가 있을 경우
            const user_check = get_order_id[_hashString('user_id')] === _hashString(user_info.user_id);
            get_order_id = get_order_id[_hashString('id')];

            if(user_check === false) {
                alert('잘못된 접근입니다.');
                return window.location.replace('/myPage/order_list');
            }

            orderAction.select_order_detail({ 'bool' : true })
            await this._selectDetail(get_order_id)
        } 

        const qry = queryString.parse(location.search);

        if(Object.keys(qry).length !== 0) {
            // 조건이 하나라도 있는 경우
            // console.log($('#order_length_result_div').offset())

            _moveScrollbar('html', 'y', 700);

            // const top = $('#order_length_result_div').offset().top;
            // $('html').animate({
            //     'top' : top
            // })
        }

        if(qry.min_price && qry.max_price) {
            if(Number(qry.min_price) > Number(qry.max_price)) {
                alert('최소 가격이 최대 가격보다 클 수 없습니다. \n최소 가격을 낮추거나 최대 가격을 올려주세요.');
            }
        }

        const date_obj = {};
        // const select_month = [1, 3, 6, 12];
        const now_date = moment().add(1, 'hours').format("YYYY-MM-DD HH:MM:SS");

        let select_num = 3;
        let start_date = null;
        let end_date = now_date.slice(0, 10);

        let allow = true;
        if(qry.month) {
            // 월 버튼으로만 조회한 경우
            select_num = Number(qry.month);

            if(Number(qry.month) > 12 || isNaN(Number(qry.month))) {
                allow = false;
            }

        } else {
            if(qry.start_date && qry.end_date) {
                
                // 달력을 조정해 조회한 경우
                select_num = null;

                start_date = qry.start_date;
                end_date = qry.end_date;

                const t1 = moment(start_date, 'YYYY-MM-DD');
                const t2 = moment(end_date, 'YYYY-MM-DD');
                
                const diff_days = Math.trunc(moment.duration(t2.diff(t1)).asDays());
                // const diff_month = Math.trunc(moment.duration(t2.diff(t1)).asMonths());

                // if(select_month.includes(diff_month)) {
                //     // select_num = diff_month;
                // }

                if(isNaN(diff_days) === false) {
                    if(diff_days > 367) {
                        allow = false;
                    }

                } else {
                    allow = false;
                }

            } else {
                if(qry.start_date || qry.end_date) {
                    allow = false;
                }
            }
        }

        if(allow === false) {
            alert('잘못된 경로입니다.');
            return window.location.replace('/myPage/order_list');
        }

        start_date = start_date === null ? moment().subtract(select_num, 'months').format('YYYY-MM-DD') : start_date;

        // 달 선택
        date_obj['select_num'] = select_num;

        // 시작일 지정하기
        date_obj['start_date'] = start_date;

        // 최종일 지정하기
        date_obj['end_date'] = end_date;

        orderAction.set_date(date_obj);

        // 내 주문 데이터 저장하기
        await this._getOrderData(start_date, get_order_id);
    }

    _getOrderData = async (start, order_id) => {
        const { user_info, orderAction, _moveScrollbar, location, configAction } = this.props;
        const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '주문 정보 가져오기' };
        const qry = queryString.parse(location.search);
        
        const moment = require('moment');
        const now_date = moment().add(1, 'hours').format("YYYY-MM-DD HH:MM:SS");

        const cover_start = qry.start_date ? qry.start_date : start;
        const cover_end = qry.end_date ? moment(qry.end_date).add(24, 'hours').format("YYYY-MM-DD HH:MM:SS") : now_date

        obj['option'] = {};
        obj['where'] = [];

        if(order_id) {
            obj['table'] = 'order_info'
            obj['join'] = true;
            obj['join_table'] = 'order';

            obj['join_arr'] = [];
            obj['join_arr'].push({ 'key1' : 'id', 'key2' : 'order_id' })

            obj['join_where'] = '*';

            obj['option']['order_id'] = '=';
            obj['option']['user_id'] = '=';

            obj['where'].push({ 'table' : 'order_info', 'key' : 'order_id', 'value' : order_id });
            obj['where'].push({ 'table' : 'order_info', 'key' : 'user_id', 'value' : user_info.id });

        } else {
            obj['option']['user_id'] = '=';
            obj['option']['order_state'] = '<>';
            obj['option']['create_date'] = 'BETWEEN';

            if(qry.order_state) {
                obj['option']['order_state'] = '=';
                obj['where'].push({ 'table' : 'order', 'key' : 'order_state', 'value' : qry.order_state });

            } else if(qry.order_state === undefined) {
                obj['option']['order_state'] = '<>';
                obj['where'].push({ 'table' : 'order', 'key' : 'order_state', 'value' : 0 });
            }

            if(qry.payment_state) {
                obj['option']['payment_state'] = '=';
                obj['where'].push({ 'table' : 'order', 'key' : 'payment_state', 'value' : qry.payment_state });
            }

            if(qry.delivery_state) {
                obj['option']['delivery_state'] = '=';
                obj['where'].push({ 'table' : 'order', 'key' : 'delivery_state', 'value' : qry.delivery_state });
            }

            if(qry.order_id) {
                obj['option']['id'] = '=';
                obj['where'].push({ 'table' : 'order', 'key' : 'id', 'value' : qry.order_id });
            }

            if(qry.order_name) {
                obj['option']['order_title'] = 'LIKE';
                obj['where'].push({ 'table' : 'order', 'key' : 'order_title', 'value' : "%" + qry.order_name + "%" });
            }

            obj['where'].push({ 'table' : 'order', 'key' : 'user_id', 'value' : user_info.id });

            const min_price = Number(qry.min_price) ? qry.min_price : 0;
            const max_price = Number(qry.max_price) ? qry.max_price : 100000000000;

            if(qry.min_price || qry.max_price) {
                // obj['option']['final_price'] = "BETWEEN";
                obj['where'].push({ 'table' : 'order', 'key' : 'final_price', 'value' : [Number(min_price), Number(max_price)]  });
            }
            obj['where'].push({ 'table' : 'order', 'key' : 'create_date', 'value' : cover_start, 'option' : 'BETWEEN', 'between_value' : cover_end });

            obj['order'] = [];
            obj['order'].push({ 'table' : 'order', 'key' : 'id', 'value' : "DESC" });

            const paging_show = qry.page_cnt ? Number(qry.page_cnt) : this.props.paging_show;
            const now_page = qry.order_page ? Number(qry.order_page) : this.props.now_page;

            const cnt_start = now_page === 1 ? 0 : ((Number(paging_show) * Number(now_page)) - Number(paging_show));
            const cnt_end = (now_page * paging_show);
            
            obj['order'].push({ 'table' : 'order', 'key' : 'limit', 'value' : [Number(cnt_start), Number(cnt_end)] });
        }

        let get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const cover_obj = obj;
        cover_obj['count'] = true;

        const cnt_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })

        // 페이징 구현에 필요한 데이터 총 갯수 구하기
        configAction.save_paging_data({ 'cnt' : cnt_data.data[0][0]['count(*)'] })
        
        let data = get_data.data[0];
        if(order_id) {
            data = data[0];

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

                if(bool) {
                    obj['join'] = true;
                    obj['join_table'] = 'goods';

                    obj['join_arr'].push({ 'key1' : 'id', 'key2' : 'goods_id' })

                    obj['join_where'].push({ 'columns' : 'thumbnail', 'as' : 'goods_thumbnail' })
                    obj['join_where'].push({ 'columns' : 'name', 'as' : 'goods_name' })

                    obj['option']['user_id'] = '=';
                    
                    obj['where'].push({ 'table' : 'cart', 'key' : 'id', 'value' : cart_list[length] });
                    obj['where'].push({ 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id });

                } else {
                    obj['table'] = 'goods';

                    // obj['join_table'] = 'review';
                    // obj['join_type'] = 'LEFT JOIN';

                    // obj['join_arr'].push({ 'key1' : 'goods_id', 'key2' : 'id' })

                    // obj['join_where'].push({ 'columns' : 'id', 'as' : 'review_id' })
                    // obj['join_where'].push({ 'columns' : 'create_date', 'as' : 'review_date' })
                    // obj['join_where'].push({ 'columns' : 'title', 'as' : 'review_title' })
                    // obj['join_where'].push({ 'columns' : 'contents', 'as' : 'review_contents' })
                    // obj['join_where'].push({ 'columns' : 'remove_date', 'as' : 'review_remove_date' })
                    // obj['join_where'].push({ 'columns' : 'score', 'as' : 'review_score' })
                    
                    obj['where'].push({ 'table' : 'goods', 'key' : 'id', 'value' : cart_list[length] });

                    // obj['option']['user_id'] = '=';
                    // obj['where'].push({ 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id });

                    // obj['option']['order_id'] = '=';
                    // obj['where'].push({ 'table' : 'review', 'key' : 'order_id', 'value' : order_id });
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
                console.log(review_data)
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

            let cart_list = JSON.parse(data.cart_list);
            let cart_data = null;

            if(typeof cart_list !== 'object') {
                cart_data = await get_cart_data([cart_list], 0, [], false);

            } else {
                cart_data = await get_cart_data(cart_list, 0, [], true);
            }

            orderAction.save_order_info({ 'cart_data' : JSON.stringify(cart_data) });
        }

        orderAction.save_order_info({ 'order_list_info' : JSON.stringify(data) });
        orderAction.save_order_info({ 'loading' : true })

        let after_move = JSON.parse(sessionStorage.getItem('after_move'));

        if(after_move) {
            after_move = after_move.id;

            const height = $('#order_list_' + after_move).offset().top;
            sessionStorage.removeItem('after_move')

            return _moveScrollbar('html', 'y', height);
        }

        return data;
    }

    // 날짜 선택
    _selectDate = (date, type) => {
        const moment = require('moment');
        const { orderAction, start_date, end_date, _filterURL, location } = this.props;
        const cover_date = moment(date).format('YYYY-MM-DD');
        const qry = queryString.parse(location.search);

        const obj = {};

        let cover_start_date = start_date;
        let cover_end_date = end_date;

        if(type === 'start') {
            // 시작일 지정
            obj['start_date'] = cover_date;
            cover_start_date = cover_date;

        } else if(type === 'end') {
            // 최종일 지정
            obj['end_date'] = cover_date;
            cover_end_date = cover_date;
        }
        obj['select_num'] = null;

        qry['start_date'] = cover_start_date;
        qry['end_date'] = cover_end_date;
        
        orderAction.set_date(obj);
        this._getOrderData(cover_start_date);

        if(qry['order_page']) {
            qry['order_page'] = 1;
        }

        return _filterURL(qry, "");
    }

    _removeOption = (type, ment) => {
        const cover_ment = ment ? ment : '해당 옵션을 삭제하시겠습니까?';

        if(window.confirm(cover_ment)) {
            const { location, _filterURL } = this.props;
            const qry = queryString.parse(location.search);

            if(type === 'order_price') {
                delete qry['min_price'];
                delete qry['max_price'];

            } else if(type === 'date') {
                delete qry['end_date'];
                delete qry['start_date'];
                delete qry['month'];
                
            } else {
                delete qry[type];
            }

            if(Object.keys(qry).length === 0) {
                return window.location.replace('/myPage/order_list');
            }

            if(qry['order_page']) {
                qry['order_page'] = 1;
            }

            return _filterURL(qry, "");
        }

        return;
    }

    // 상세 정보 선택하기
    _selectDetail = async (id, move) => {
        const { orderAction, _getCookie, _hashString, user_info } = this.props;
        const order_info = JSON.parse(this.props.order_list_info);
        // orderAction.select_order_detail({ 'id' : id })

        if(id !== null) {
            const url_obj = {};
            url_obj[_hashString('id')] = id;

            const save_url = window.location.pathname + window.location.search;
            url_obj[_hashString('save_url')] = save_url;
            url_obj[_hashString('user_id')] = _hashString(user_info.user_id);

            await _getCookie(_hashString('detail_order_id'), 'add', JSON.stringify(url_obj), { 'time' : 60 });

            const session_obj = {};
            session_obj[_hashString('user_id')] = _hashString(String(user_info.id));

            sessionStorage.setItem(_hashString('detail_order_id'), JSON.stringify(session_obj))
            
            if(move === true) {
                return window.location.href = save_url;

            } else {
                orderAction.select_order_detail({ 'id' : id })
            }

        } else {
            let get_save_url = await _getCookie(_hashString('detail_order_id'), 'get');

            get_save_url = get_save_url[_hashString('save_url')];

            if(!get_save_url) {
                get_save_url = '/myPage/order_list';
            }

            await _getCookie(_hashString('detail_order_id'), 'remove');
            sessionStorage.removeItem(_hashString('detail_order_id'))

            sessionStorage.setItem('after_move', JSON.stringify({ 'id' : order_info.id }) )
            return window.location.href = get_save_url;
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

                const get_order_data = await this._getOrderData(start_date, order_info.id);

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

    // 입금 처리
    _orderPayment = async (order_id) => {
        const order_info = JSON.parse(this.props.order_list_info);
        const { _setPoint, user_info, _setGoodsStock, start_date, orderAction } = this.props;

        if(order_payment_bool === false) {
            order_payment_bool = true;

            const get_order_data = await this._getOrderData(start_date, order_info.id);

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

    // cart_data 구하기
    _setCartData = async () => {
        const order_info = JSON.parse(this.props.order_list_info);
        let cart_data = JSON.parse(order_info.cart_list);
        const { user_info } = this.props;

        const cart_each_type = typeof cart_data === 'number' ? true : false;

        const get_cart_obj = { 'type' : 'SELECT', 'comment' : 'cart data 구하기' };
        get_cart_obj['option'] = {};
        get_cart_obj['where'] = [];

        if(typeof cart_data === 'number') {
            // goods id 일 경우
            get_cart_obj['table'] = 'goods';

            get_cart_obj['option']['id'] = '=';

            cart_data = [cart_data];

        } else if(typeof cart_data === 'object') {
            // cart id 일 경우
            get_cart_obj['table'] = 'cart';
            get_cart_obj['join'] = true;
            get_cart_obj['join_table'] = 'goods';

            get_cart_obj['join_arr'] = [];
            get_cart_obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'goods_id' }

            get_cart_obj['join_where'] = [];
            get_cart_obj['join_where'].push({ 'columns' : 'stock', 'as' : 'stock' });
            get_cart_obj['join_where'].push({ 'columns' : 'sales', 'as' : 'sales' });

            get_cart_obj['option']['user_id'] = '=';
            get_cart_obj['option']['id'] = '=';

            get_cart_obj['where'][0] = { 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id };
        }

        const result_data = [];
        const get_cart_data = async (length) => {
            if(result_data.length === cart_data.length) {
                return result_data;
            }

            if(cart_each_type === true) {
                // el 이 goods 테이블의 id
                get_cart_obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : cart_data[length] };
    
            } else {
                // el 이 cart 테이블의 id
                get_cart_obj['where'][1] = { 'table' : 'cart', 'key' : 'id', 'value' : cart_data[length] };
            }
    
            const get_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : get_cart_obj
            });
    
            result_data.push(get_data.data[0][0]);

            return get_cart_data(length + 1);
        }

        const cover_cart_data = await get_cart_data(0);
        return cover_cart_data;
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

    _selectFilterOption = (type) => {
        const select_opt = $('select[name=' + type + '_select]').val();
        const { _filterURL, location } = this.props;

        const qry = queryString.parse(location.search);
        qry[type] = select_opt;

        if(select_opt === '-') {
            delete qry[type];
        }

        if(Object.keys(qry).length === 0) {
            return window.location.replace('/myPage/order_list');
        }

        if(qry['order_page']) {
            qry['order_page'] = 1;
        }

        return _filterURL(qry, "");
    }

    // 기간 설정 filter
    _setDateFilter = (num) => {
        const { _filterURL, location } = this.props;
        const qry = queryString.parse(location.search);

        qry['month'] = num;

        if(qry.end_date) {
            delete qry.end_date
        };

        if(qry.start_date) {
            delete qry.start_date
        };

        if(Object.keys(qry).length === 0) {
            return window.location.replace('/myPage/order_list');
        }

        if(qry['order_page']) {
            qry['order_page'] = 1;
        }

        return _filterURL(qry, "");
    }

    _stringFilter = (event) => {
        event.preventDefault();
        const { _filterURL, location } = this.props;
        const qry = queryString.parse(location.search);

        const form_data = event.target;

        const order_id = form_data.order_id.value.trim();
        const order_name = form_data.order_name.value.trim();
        const order_min_price = Number(form_data.order_min_price.value);
        const order_max_price = Number(form_data.order_max_price.value);

        if(order_id > 0 || order_id !== "") {
            qry['order_id'] = order_id

        } else {
            delete qry['order_id'];
        }

        if(order_name.length > 0) {
            qry['order_name'] = order_name
        
        } else {
            delete qry['order_name'];
        }

        if(order_min_price > 0) {
            qry['min_price'] = order_min_price

        } else {
            delete qry['min_price'];
        }

        if(order_max_price > 0) {
            qry['max_price'] = order_max_price

        } else {
            delete qry['max_price'];
        }

        if(qry["min_price"] > qry["max_price"]) {
            alert('최소 가격이 최대 가격보다 클 수 없습니다. \n최소 가격을 낮추거나 최대 가격을 올려주세요.');
            $('input[name=order_min_price]').focus();

            return;
        }

        if(Object.keys(qry).length === 0) {
            return window.location.replace('/myPage/order_list');
        }

        if(qry['order_page']) {
            qry['order_page'] = 1;
        }

        return _filterURL(qry, "");
    }

    _setPageCnt = (event) => {
        event.preventDefault();
        const { location, _filterURL } = this.props;

        const qry = queryString.parse(location.search);
        const data = Number(event.target.value);

        qry['page_cnt'] = data;

        if(qry['order_page']) {
            delete qry['order_page'];
        }

        return _filterURL(qry, "");
    }

    _orderListRemoveReview = async (review_id, qry, order_id, goods_id, score) => {
        const { _removeReview } = this.props;
        const { _getOrderData } = this;

        const start_date = qry.start_date ? Date.parse(qry.start_date) : Date.parse(this.props.start_date);
        
        const remove_review = await _removeReview(review_id, goods_id, score, null, true);

        if(remove_review === true) {
            await _getOrderData(start_date, order_id);

            return alert('리뷰가 삭제되었습니다.');
        }
    }

    _openReviewModal = (goods_id, order_id, start_date) => {
        const { configAction, orderAction } = this.props;
        const { _getOrderData } = this;

        const obj = {};
            obj['bool'] = true
            obj['goods_id'] = goods_id
            obj['order_id'] = order_id
            obj['callback'] = _getOrderData

        configAction.toggle_review_modal(obj);
        orderAction.set_date({ 'start_date' : start_date });
    }

    render() {
        const { 
            start_select_num, order_loading, location, order_detail_select, order_detail_bool, price_comma, 
            _setModalStyle, order_cancel_modal, order_canceling, paging_cnt, _filterURL
        } = this.props;

        const { 
            _selectDetail, _orderComplate, _selectDate, _removeOption, _orderCancel, _orderPayment, 
            _selectCancelReason, _selectClickEvent, _selectFilterOption, _setDateFilter, _stringFilter, _setPageCnt,
            _orderListRemoveReview, _openReviewModal
        } = this;
        
        const order_info = JSON.parse(this.props.order_list_info);

        const qry = queryString.parse(location.search);
        const moment = require('moment');
        
        const now_date = Date.parse(this.props.now_date.slice(0, 10));
        const start_date = qry.start_date ? Date.parse(qry.start_date) : Date.parse(this.props.start_date);
        const end_date = qry.end_date ? Date.parse(qry.end_date) : Date.parse(this.props.end_date);

        let min_date = moment(end_date).subtract(12, 'months').format('YYYY-MM-DD');
        min_date = Date.parse(min_date);

        let max_date = moment(start_date).add(12, 'months').format('YYYY-MM-DD');
        max_date = Date.parse(max_date);

        if(max_date > now_date) {
            max_date = now_date;
        }

        // 검색 옵션 조건 구하기
        const condifion_option = (qry.month || start_select_num) || qry.start_date || qry.end_date;
        let date_option = '';
        let diff_days = '';

        if(condifion_option) {
            const t1 = moment(this.props.start_date, 'YYYY-MM-DD');
            const t2 = moment(this.props.end_date, 'YYYY-MM-DD');
                
            diff_days = Math.trunc(moment.duration(t2.diff(t1)).asDays());

            date_option = "기간 : " + this.props.start_date + " ~ " + this.props.end_date;
        }

        let payment_state = '미입금';
        let delivery_state = '-';

        let payment_type = '무통장 입금';
        let bank_ment = '[ 농협 - X ] 로 입금해주세요.';

        if(order_detail_bool === true) {
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
        }

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

        const filter_opt = {};
        if(qry.order_state === '1') {
            filter_opt['order_state'] = '주문 완료'
        } else if(qry.order_state === '2') {
            filter_opt['order_state'] = '주문 확정'
        } else if(qry.order_state === '3') {
            filter_opt['order_state'] = '주문 취소'
        }

        if(qry.payment_state === '1') {
            filter_opt['payment_state'] = '결제 완료';
        } else if(qry.payment_state === '0') {
            filter_opt['payment_state'] = '결제 전';
        }

        if(qry.delivery_state === '1') {
            filter_opt['delivery_state'] = '배송 준비중';
        } else if(qry.delivery_state === '2') {
            filter_opt['delivery_state'] = '배송 중';
        } else if(qry.delivery_state === '3') {
            filter_opt['delivery_state'] = '배송 완료';
        }

        let price_filter = '';
        if(qry.min_price && qry.max_price) {
            // 둘다 있는 경우
            price_filter = price_comma(qry.min_price) + ' 원 ~ ' + price_comma(qry.max_price) + ' 원';

        } else {
            // 하나만 있는 경우
            if(qry.min_price) {
                price_filter = price_comma(qry.min_price) + ' 원 ~';

            } else if(qry.max_price) {
                price_filter = '~ ' + price_comma(qry.max_price) + ' 원';
            }
        }

        let filter_search_check = false;
        const check_arr = ['start_date', 'end_date', 'month', 'order_state', 'delivery_state', 'payment_state', 'min_price', 'max_price', 'order_id', 'order_name']
        Object.keys(qry).forEach( (el) => {
            if(check_arr.includes(el)) {
                filter_search_check = true;
            }
        })

        const paging_show = qry.page_cnt ? Number(qry.page_cnt) : this.props.paging_show;
        const now_page = qry.order_page ? Number(qry.order_page) : this.props.now_page; 

        const star_arr = [1, 2, 3, 4, 5];

        return(
            <div id='order_list_tools'>
                {order_loading === true ?

                order_detail_select === null ?
                <div id='order_list_origin_page'>
                    <div id='order_list_date_grid_div'>
                        <div id='order_list_date_select_gird_div'>
                                <div id='order_list_set_date_div'>
                                    <div className='bold font_14'> 기간 설정 </div>
                                    <div id='order_list_set_date'>
                                        <DatePicker className='pointer aCenter' name='order_list_date_start' selected={start_date}
                                            locale={ko} dateFormat="yyyy-MM-dd" minDate={min_date} maxDate={end_date} closeOnScroll={true}
                                            placeholderText="조회 시작 날짜" onChange={(date) => _selectDate(date, 'start')}
                                            showPopperArrow={false} popperModifiers
                                        />
                                        {/* <input type='text' className='pointer aCenter' disabled readOnly name='order_list_date_start' defaultValue={start_date} /> */}
                                        　~　
                                        <DatePicker 
                                            className='pointer aCenter' name='order_list_date_end'  selected={end_date}
                                            locale={ko} dateFormat="yyyy-MM-dd" minDate={start_date} maxDate={max_date} closeOnScroll={true}
                                            placeholderText="조회 끝 날짜" onChange={(date) => _selectDate(date, 'end')}
                                            showPopperArrow={false}
                                            popperModifiers={{ // 모바일 web 환경에서 화면을 벗어나지 않도록 하는 설정 
                                                preventOverflow: { enabled: true, }, }} 
                                                popperPlacement="auto" // 화면 중앙에 팝업이 뜨도록
                                        />
                                        {/* <input type='text' className='pointer aCenter' disabled readOnly name='order_list_date_end' defaultValue={now_date} /> */}
                                    </div>
                                </div>

                                <div id={qry.start_date && qry.end_date ? 'order_list_select_date_div_2' : 'order_list_select_date_div' } className='order_list_select_grid_div font_13'>
                                    {qry.start_date && qry.end_date
                                        ? <div id='filter_month' className='bold white' title='필터를 삭제합니다.'
                                            onClick={() => _removeOption('date', '설정한 기간 옵션을 해제하시겠습니까?')}
                                            >
                                            필터 X
                                        </div>

                                        : null
                                    }

                                    <div id={start_select_num === 1 ? 'select_month' : null}
                                        onClick={() => start_select_num !== 1 ? _setDateFilter(1) : null}
                                    > 
                                        1 개월 
                                    </div>
                                    <div id={start_select_num === 3 ? 'select_month' : null}
                                        onClick={() => start_select_num !== 3 ? _setDateFilter(3) : null}
                                    > 
                                        3 개월
                                    </div>
                                    <div id={start_select_num === 6 ? 'select_month' : null}
                                        onClick={() => start_select_num !== 6 ? _setDateFilter(6) : null}
                                    > 
                                        6 개월
                                    </div>
                                    <div id={start_select_num === 12 ? 'select_month' : null}
                                        onClick={() => start_select_num !== 12 ? _setDateFilter(12) : null}
                                    > 
                                        1 년 
                                    </div>
                            </div>
                        </div>

                        <div id='order_list_search_option_div'>
                            <div id='order_list_filter_grid_div'>
                            <div className='order_list_filter_list_div font_13'>
                                <div> 주문 상태　|　
                                    <select className='order_list_filter_select'
                                            name='order_state_select'
                                            onChange={() => _selectFilterOption('order_state')}
                                            defaultValue={qry.order_state}
                                    >
                                        <option value={null}> - </option>
                                        <option value='1'> 주문 완료 </option>
                                        <option value='2'> 주문 확정 </option>
                                        <option value='3'> 주문 취소 </option>
                                    </select>
                                </div>

                                <div> 결제 상태　|　
                                    <select className='order_list_filter_select'
                                            name='payment_state_select'
                                            onChange={() => _selectFilterOption('payment_state')}
                                            defaultValue={qry.payment_state}
                                    >
                                        <option value={null}> - </option>
                                        <option value='1'> 결제 완료 </option>
                                        <option value='0'> 결제 전 </option>
                                    </select>
                                </div>

                                <div> 배송 상태　|　
                                    <select className='order_list_filter_select'
                                            name='delivery_state_select'
                                            onChange={() => _selectFilterOption('delivery_state')}
                                            defaultValue={qry.delivery_state}
                                    >
                                        <option value={null}> - </option>
                                        <option value='1'> 배송 준비중 </option>
                                        <option value='2'> 배송중 </option>
                                        <option value='3'> 배송 완료 </option>
                                    </select>
                                </div>
                            </div>

                            <form onSubmit={_stringFilter}>
                                <div className='order_list_filter_list_div'>
                                    <div>
                                        주문 번호　|　<input type='number' max={999999} name='order_id' className='order_list_filter_input' 
                                                        defaultValue={qry.order_id}
                                                    />
                                        <input type='image' src={icon.icon.search_black} className='order_filter_search_icon' alt='' />
                                    </div>

                                    <div>
                                        주문 이름　|　<input type='text' maxLength='15' name='order_name' className='order_list_filter_input' 
                                                        defaultValue={qry.order_name}
                                                    />
                                        <input type='image' src={icon.icon.search_black} className='order_filter_search_icon' alt='' />
                                    </div>

                                    <div>
                                        가격 설정　|　
                                        <input type='number' name='order_min_price' className='order_list_filter_input order_list_filter_price_input' id='order_list_min_price_input' 
                                            defaultValue={qry.min_price} max={1000000000}/> ~ 
                                        <input type='number' name='order_max_price' className='order_list_filter_input order_list_filter_price_input' id='order_list_max_price_input' 
                                            defaultValue={qry.max_price} max={1000000000}/> 
                                        <input type='image' src={icon.icon.search_black} className='order_filter_search_icon' alt='' />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {condifion_option
                            ? <div id='order_list_option_div' className='aLeft'>
                                <h4> ● 검색 옵션 </h4>
                                {filter_search_check === true
                                ? <img src={icon.icon.reload} id='order_list_filter_reload' title='검색 옵션 초기화' className='pointer' alt=''
                                    onClick={() => window.confirm('검색 옵션을 초기화하시겠습니까?') ? window.location.replace('/myPage/order_list') : null }
                                 />
                                : null }

                                    <ul id='order_list_option_ul'>
                                        {date_option 
                                            ? <li> {date_option} 
                                                    {diff_days > 0 ? <b className='gray'> ( {diff_days} 일 ) </b> : null}
                                                    {qry.month || qry.start_date || qry.end_date ? 
                                                        <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                            onClick={() => _removeOption('date')} />
                                                        : null}
                                            </li> 
                                            : null
                                        }

                                        {qry.order_state
                                            ? <li>
                                                주문 상태 : {filter_opt['order_state']}
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                          onClick={() => _removeOption('order_state')} />
                                              </li>
                                        
                                            : null
                                        }

                                        {qry.payment_state
                                            ? <li>
                                                결제 상태 : {filter_opt['payment_state']}
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                          onClick={() => _removeOption('payment_state')} />
                                              </li>
                                        
                                            : null
                                        }

                                        {qry.delivery_state
                                            ? <li>
                                                배송 상태 : {filter_opt['delivery_state']}
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                          onClick={() => _removeOption('delivery_state')} />
                                              </li>
                                        
                                            : null
                                        }

                                        {qry.order_id
                                            ? <li>
                                                주문 번호 : {qry.order_id} 번
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                          onClick={() => _removeOption('order_id')} />
                                              </li>
                                        
                                            : null
                                        }

                                        {qry.order_name
                                            ? <li>
                                                주문 이름 : <u className='bold'> {qry.order_name} </u>
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt=''
                                                          onClick={() => _removeOption('order_name')} />
                                              </li>
                                        
                                            : null
                                        }

                                        {price_filter !== '' && (qry.min_price || qry.max_price)
                                            ? <li className={ Number(qry.min_price) > Number(qry.max_price) ? 'red bold' : null }>
                                                {Number(qry.min_price) > Number(qry.max_price) ? <p className='red bold aLeft' className='order_list_filter_alert'> ( 가격을 조정해주세요. ) </p> : null } 
                                                가격 설정 : {price_filter}
                                                <img src={icon.icon.close_black} className='order_list_remove_icon' alt='' 
                                                          onClick={() => _removeOption('order_price')} />
                                              </li>
                                        
                                            : null
                                        }
                                    </ul>
                            </div>
                            : null                                
                        }

                        <div className='order_list_paging_div'>
                            <Paging 
                                paging_cnt={paging_cnt}
                                paging_show={paging_show}
                                now_page={now_page}
                                page_name='order_page'
                                _filterURL={_filterURL}
                                qry={qry}
                            />
                        </div>

                        {order_info.length === 0
                        
                            ? <div className='aCenter paybook_bold'> 
                                <h3 id='order_list_empty_title'> 주문 내역이 없습니다. </h3>
                            </div>

                            : <div> 
                                <div id='order_length_result_div'>
                                    <div> <h4> 총 {paging_cnt} 건의 주문 내역들을 조회했습니다. </h4> </div>
                                    <div id='order_list_select_page_cnt' className='aRight'>
                                        <select name='select_page_cnt' className='pointer' id='order_list_page_cnt_select'
                                                defaultValue={paging_show} onChange={(event) => _setPageCnt(event)}
                                        >
                                            <option value={10}> 10 개씩 조회 </option>
                                            <option value={20}> 20 개씩 조회 </option>
                                            <option value={30}> 30 개씩 조회 </option>
                                            <option value={40}> 40 개씩 조회 </option>
                                            <option value={50}> 50 개씩 조회 </option>
                                        </select>
                                    </div>
                                </div>

                                <div id='order_list_contents_div'>
                                    {order_info.map( (el, key) => {
                                        let payment_state = '결제 미확인';
                                        const title = '[ ' + el.order_title + ' ] 상세 정보로 이동';

                                        let delivery_state = '-';
                                        let color = '#ababab';

                                        // 배송 현황
                                        if(el.delivery_state === 1) {
                                            delivery_state = '배송 준비중';
                                        }

                                        if(el.payment_state === 1) {
                                            payment_state = '결제 완료';
                                            color = 'black';
                                        } 
                                        
                                        if(el.order_state === 2) {
                                            payment_state = '주문 확정';
                                            color = '#35c5f0';

                                        } else if(el.order_state === 3) {
                                            payment_state = '주문 취소';
                                            color = '#eb596e'
                                            delivery_state = '-';
                                        }

                                        let order_title = el.order_title;
                                        if(qry.order_name) {
                                            const first_idx = order_title.indexOf(qry.order_name);
                                            const slice_str = order_title.slice(0, first_idx);
                                            const last_str = order_title.slice((first_idx + qry.order_name.length), order_title.length);

                                            order_title = slice_str + `<b class='bold search_line'> ${qry.order_name} </b>` + last_str;
                                        }

                                        return(
                                            <div className='order_list_contents_divs font_13 pointer' key={key} title={title}
                                                id={'order_list_' + el.id}
                                                onClick={() => _selectDetail(el.id, true)}
                                            >
                                                <div className='order_list_top_div'>
                                                    <div> 주문 번호　|　{el.id} </div>
                                                    <div className='order_list_contents_date_div'> 주문 일자　|　{el.buy_date}  </div>
                                                    <div className='order_list_contents_grid_div'> 
                                                        <div className='aRight'> 주문 현황　|　</div>
                                                        <div className='bold aLeft' style={ { 'color' : color } }> {payment_state} </div>
                                                    </div>
                                                </div>

                                                <div className='order_list_middle_div'>
                                                    <div className='order_list_contents_title_div cut_one_line paybook_bold'
                                                         dangerouslySetInnerHTML={{ __html : order_title }}
                                                    />
                                                    <div className='order_list_contents_grid_div'> 
                                                        <div className='aRight'> 배송 현황　|　</div>
                                                        <div className='aLeft'> {delivery_state} </div>
                                                    </div>
                                                </div>

                                                <div className='order_list_bottom_div'>
                                                    <div className='order_list_responsive_div display_none'>
                                                        <div> 주문 현황　|　<b style={ { 'color' : color } }>{payment_state} </b> </div>
                                                        <div> 배송 현황　|　{delivery_state} </div>
                                                    </div>

                                                    <div className='order_list_price_info_and_move_div'>
                                                        <div> 결제 금액　|　<b> {price_comma(el.final_price)} 원 </b> </div>

                                                        <div className='order_list_detail_move_div'>
                                                            <u className='remove_underLine pointer gray'> 상세 정보로 이동 ▶ </u>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {order_info.length > 5 ? 
                                    <div className='order_list_paging_div'>
                                            <Paging 
                                                paging_cnt={paging_cnt}
                                                paging_show={paging_show}
                                                now_page={now_page}
                                                page_name='order_page'
                                                _filterURL={_filterURL}
                                                qry={qry}
                                            />
                                    </div>
                                : null}

                            </div>
                        }
                        </div>
                    </div>

                    </div>
                        : <div id='order_list_detail_info_div'>
                            <div className='order_list_back_move_div pointer paybook_bold'
                                 onClick={() => _selectDetail(null, true)}
                            >
                                <div> ◀　뒤로 가기 </div>
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
                                 onClick={() => _selectDetail(null, true)}
                            >
                                <div> ◀　뒤로 가기 </div>
                            </div>
                        </div>
                : null}
            </div>
        )
    }
}

OrderList.defaultProps = {
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
      goodsAction : bindActionCreators(goodsAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch)
    })
  )(OrderList);