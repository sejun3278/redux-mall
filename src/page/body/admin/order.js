import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import DatePicker from "react-datepicker";
import { ko } from "date-fns/esm/locale";
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Paging from '../../config/paging';
import * as adminAction from '../../../Store/modules/admin';
import * as configAction from '../../../Store/modules/config';
import '../../../css/home.css';

import $ from 'jquery';
import URL from '../../../config/url';
import icon from '../../../source/img/icon.json';

import order_list from '../../config/admin_order_list.json';
import OrderDetail from './order_detail';

let updating = false;
class AdminOrder extends Component {

    async componentDidMount() {
        // 주문 정보 저장
        await this._getOrderList();

        // 초기 Date 데이터 설정
        const { location, adminAction } = this.props;
        const qry = queryString.parse(location.search);

        const moment = require('moment');
        // const cover_date = moment(date).format('YYYY-MM-DD');
        
        const save_obj = {};

        if(qry.filter_order_start_date) {
            save_obj['start'] = Date.parse(qry.filter_order_start_date);
            save_obj['bool'] = true;

            if(!qry.filter_order_end_date) {
                alert('올바르지 않는 경로입니다.');
                return window.location.replace('/admin/order');
            }

        } else {
            const start = moment().subtract(12, 'months').format('YYYY-MM-DD');
            save_obj['start'] = Date.parse(start);
        }

        if(qry.filter_order_end_date) {
            save_obj['end'] = Date.parse(qry.filter_order_end_date);
            save_obj['bool'] = true;

            if(!qry.filter_order_start_date) {
                alert('올바르지 않는 경로입니다.');
                return window.location.replace('/admin/order');
            }

        } else {
            save_obj['end'] = Date.parse(moment().format('YYYY-MM-DD'));
        }

        if(!save_obj['bool']) {
            $('.admin_order_select_date').css({ 'backgroundColor' : '#e7e6e1' })
        }

        adminAction.set_date(save_obj);
    }


    _addFilter = (event, type) => {
        event.preventDefault();
        const { location, _filterURL, date_change } = this.props;
        const form_data = event.target;

        const qry = queryString.parse(location.search);

        let checked = false;
        if(!type) {
            // 필터가 하나 이상 검색되어 있는지 판단
            if(Object.keys(qry).length > 0) {
                checked = true;
            }

                const filter_view = ['filter_order_type', 'filter_order_state', 'filter_payment_state', 'filter_delivery_state']
                for(let i = 0; i < form_data.length - 1; i++) {
                    var value = form_data[i].value;
                    var name = form_data[i].name;

                    if(filter_view.includes(name)) {
                        if(value === 'none') {
                            delete qry[name];

                        } else {
                            qry[name] = value;
                        }

                    } else {
                        if(String(value).trim().length === 0) {
                            delete qry[name];

                        } else {
                            if(name === 'filter_order_min_price' || name === 'filter_order_max_price') {
                                if(Number(value) > 0) {
                                    qry[name] = value;
                                }
            
                            } else if(name === 'filter_order_start_date' || name === 'filter_order_end_date') {
                                if(date_change === true) {
                                    qry[name] = value;

                                } else {
                                    delete qry['filter_order_start_date'];
                                    delete qry['filter_order_end_date'];
                                }
                            
                            } else {
                                qry[name] = value;
                            }
                        }
                    }
                }

            } else {
                if(qry[type]) {
                    delete qry[type];

                } else {
                    if(type === 'filter_order_price') {
                        delete qry['filter_order_min_price'];
                        delete qry['filter_order_max_price'];

                    } else if(type === 'filter_order_date') { 
                        delete qry['filter_order_start_date'];
                        delete qry['filter_order_end_date'];

                    } else {
                        const value = form_data[type].value;
                        qry[type] = value;
                    }
                }
            }

            if(Object.keys(qry).length === 0) {
                if(checked === true || type) {
                    return window.location.href = '/admin/order';

                } else if(!type) {
                    alert('검색할 필터를 하나 이상 설정해주세요.');
                    return;
                }

            } else {
                const min_price = Number(qry['filter_order_min_price']);
                const max_price = Number(qry['filter_order_max_price']);

                if(min_price && max_price) {
                    if(min_price > max_price) {
                        alert('최소 가격이 최대 가격보다 큽니다. \n최소 가격 및 최대 가격을 조정해주세요.');
                        $('input[name=filter_order_min_price]').focus();

                        return;
                    }
                }
            }

            delete qry['order_page'];

            if(Object.keys(qry).length === 0) {
                return window.location.href = '/admin/order';
            }

        return _filterURL(qry, "");
    }

    _getOrderList = async () => {
        const { adminAction, location } = this.props;
        const qry = queryString.parse(location.search);

        const obj = { 'type' : 'SELECT' , 'table' : 'order', 'comment' : '주문 정보 가져오기', 'join' : true, 'join_table' : 'userInfo' };

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'user_id' }
  
        obj['join_where'] = [];
        obj['join_where'].push({ 'columns' : 'user_id', 'as' : 'order_user_id' });

        obj['option'] = {};
        obj['where'] = [];

        if(qry.filter_order_type) {
            obj['option']['order_type'] = '='
            obj['where'].push({ 'table' : 'order', 'key' : 'order_type', 'value' : qry.filter_order_type })
        }

        if(qry.filter_order_state) {
            obj['option']['order_state'] = '='
            obj['where'].push({ 'table' : 'order', 'key' : 'order_state', 'value' : qry.filter_order_state })

        } else {
            obj['option']['order_state'] = '<>'
            obj['where'].push({ 'table' : 'order', 'key' : 'order_state', 'value' : 0 })
        }

        if(qry.filter_payment_state) {
            obj['option']['payment_state'] = '='
            obj['where'].push({ 'table' : 'order', 'key' : 'payment_state', 'value' : qry.filter_payment_state })
        }

        if(qry.filter_delivery_state) {
            obj['option']['delivery_state'] = '='
            obj['where'].push({ 'table' : 'order', 'key' : 'delivery_state', 'value' : qry.filter_delivery_state })
        }

        if(qry.filter_order_id) {
            obj['option']['id'] = '='
            obj['where'].push({ 'table' : 'order', 'key' : 'id', 'value' : qry.filter_order_id })
        }

        if(qry.filter_user_id) {
            obj['option']['user_id'] = '='
            obj['where'].push({ 'table' : 'userInfo', 'key' : 'user_id', 'value' : qry.filter_user_id })
        }

        if(qry.filter_order_min_price || qry.filter_order_max_price) {
            const min_price = qry.filter_order_min_price ? qry.filter_order_min_price : 0;
            const max_price = qry.filter_order_max_price ? qry.filter_order_max_price : 100000000000000000;

            obj['option']['final_price'] = ''
            obj['where'].push({ 'table' : 'order', 'key' : 'final_price', 'value' : [min_price, max_price] })
        }

        if(qry.filter_order_start_date && qry.filter_order_end_date) {
            const cover_start = qry.filter_order_start_date;
            const cover_end = qry.filter_order_end_date;

            obj['option']['create_date'] = 'BETWEEN';
            obj['where'].push({ 'table' : 'order', 'key' : 'create_date', 'value' : cover_start, 'option' : 'BETWEEN', 'between_value' : cover_end });
        }

        obj['order'] = [];
        obj['order'][0] = { 'table' : 'order', 'key' : 'id', 'value' : 'DESC' };

        if(qry.view_option === 'past') {
            obj['order'][0] = { 'table' : 'order', 'key' : 'id', 'value' : 'ASC' };

        } else if(qry.view_option === 'higher') {
            obj['order'][0] = { 'table' : 'order', 'key' : 'final_price', 'value' : 'DESC' };

        } else if(qry.view_option === 'lower') {
            obj['order'][0] = { 'table' : 'order', 'key' : 'final_price', 'value' : 'ASC' };
        }

        const now_page = qry.order_page ? qry.order_page : 1;

        const start = now_page === 1 ? 0 : (20 * Number(now_page)) - 20;
        const end = now_page * 20;

        obj['order'][1] = { 'table' : 'order', 'key' : 'limit', 'value' : [start, end] }

        const get_order_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });
        const order_data = get_order_data.data[0];

        // 총 갯수 가져오기
        const cover_obj = obj;
        cover_obj['count'] = true;

        const get_order_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        });
        const order_cnt = get_order_cnt.data[0][0]['count(*)'];

        const save_obj = {};
        save_obj['info'] = JSON.stringify(order_data);
        save_obj['length'] = order_cnt;

        adminAction.save_admin_order_data(save_obj);
        adminAction.data_loading({ 'bool' : true });
    }

    _getFilterOption = (qry) => {
        const { price_comma } = this.props;
        const list = order_list.order_list;

        const result = {};
        for(let key in qry) {

            if(list[key] !== undefined) {
                if(key === 'filter_order_max_price' || key === 'filter_order_min_price') {
                    if(!result['filter_order_price']) {
                        result['filter_order_price'] = {};
                    }

                    result["filter_order_price"]['name'] = '결제 금액';
                    result["filter_order_price"]['type'] = 'filter_order_min_price';
                    
                    result["filter_order_price"]['value'] = "";

                } else if(key === 'filter_order_start_date' || key === 'filter_order_end_date') { 
                    if(!result['filter_order_date']) {
                        result['filter_order_date'] = {};
                    }

                    result["filter_order_date"]['name'] = '주문 일자';
                    result["filter_order_date"]['type'] = 'filter_order_start_date';
                    
                    result["filter_order_date"]['value'] = "";
                
                } else {
                    result[key] = {};

                    result[key]['name'] = list[key].name;
                    result[key]['type'] = list[key].type;

                    result[key]['value'] = null;
                }

                if(list[key].list) {
                    result[key]['value'] = list[key].list[qry[key]].name;

                } else {
                    if(key === 'filter_order_max_price' || key === 'filter_order_min_price') {
                        let price_value = result["filter_order_price"]['value'];

                        if(qry["filter_order_min_price"]) {
                            price_value = price_comma(qry["filter_order_min_price"]) + " 원 ~ ";

                            if(qry["filter_order_max_price"]) {
                                price_value += price_comma(qry["filter_order_max_price"]) + " 원";
                            }

                        } else {
                            if(qry["filter_order_max_price"]) {
                                price_value = '~ ' + price_comma(qry["filter_order_max_price"]) + " 원";
                            }
                        }

                        result["filter_order_price"]['value'] = price_value;

                    } else if(key === 'filter_order_start_date' || key === 'filter_order_end_date') { 
                        let date_value = result['filter_order_date']['value'];

                        date_value += qry['filter_order_start_date'] + ' ~ ' +  qry['filter_order_end_date']
                    
                        result["filter_order_date"]['value'] = date_value;

                    } else {
                        result[key]['value'] = qry[key];
                    }
                }
            }
        }

        return result;
    }

    _selectDate = (date, type) => {
        const { adminAction } = this.props

        const moment = require('moment');
        const cover_date = moment(date).format('YYYY-MM-DD');

        const save_obj = {};

        save_obj[type] = Date.parse(cover_date);
        save_obj['bool'] = true;

        $('.admin_order_select_date').css({ 'backgroundColor' : 'white' })

        adminAction.set_date(save_obj);
    }

    _deleteDate = () => {
        const { adminAction } = this.props;
        const moment = require('moment');

        const save_obj = {};

        const start = moment().subtract(12, 'months').format('YYYY-MM-DD');
        save_obj['start'] = Date.parse(start);

        const end = moment().format('YYYY-MM-DD');
        save_obj['end'] = Date.parse(end);

        save_obj['bool'] = false;

        $('.admin_order_select_date').css({ 'backgroundColor' : '#e7e6e1' })

        adminAction.set_date( save_obj );
    }

    _addViewFilter = (type, value) => {
        const { _filterURL, location } = this.props;
        const qry = queryString.parse(location.search);

        if(qry[type] === value) {
            delete qry[type];

        } else {
            qry[type] = value;
        }

        delete qry['order_page'];

        if(Object.values(qry).length === 0) {
            return window.location.href = '/admin/order';
        }

        return _filterURL(qry, "");
    }

    _toggleModal = (info) => {
        const { configAction, adminAction } = this.props;

        adminAction.save_admin_order_data({ 'detail_info' : JSON.stringify(info) })
        configAction.toggle_modal({ 'bool' : true })   
    }

    _closeModal = () => {
        const { configAction, adminAction } = this.props;

        configAction.toggle_modal({ 'bool' : false })
        adminAction.save_admin_order_data({ 'bool' : false })
    }

    _stateUpdate = async (id, type) => {
        const allow_obj = { 'allow' : true, 'comment' : null }

        if(updating === true) {
            alert('처리중입니다. 잠시만 기다려주세요.');
            return;
        }

        const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '주문 정보 가져오기', 'join' : true, 'join_table' : 'order_info' };
        
        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'order_id', 'key2' : 'id' }
  
        obj['join_where'] = [];
        obj['join_where'].push({ 'columns' : 'info_agree', 'as' : 'info_agree' });
        obj['join_where'].push({ 'columns' : 'post_email', 'as' : 'post_email' });
        obj['join_where'].push({ 'columns' : 'post_name', 'as' : 'post_name' });

        obj['option'] = { 'id' : '=' };
        obj['where'] = [ { 'table' : 'order', 'key' : 'id', 'value' : id } ];

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });
        const order_info = get_data.data[0][0];

        const update_qry = { 'type' : 'UPDATE', 'table' : 'order', 'comment' : '주문 상태들 업데이트' }

        update_qry['where_limit'] = 1;

        update_qry['columns'] = [];
        // update_order['columns'].push({ 'key' : 'order_type', 'value' : order_type });

        update_qry['where'] = [];        
        update_qry['where'][0] = { 'key' : 'user_id', 'value' : order_info.user_id };
        update_qry['where'][1] = { 'key' : 'id', 'value' : order_info.id };

        const { _setGoodsStock, _setPoint, _sendMailer, _addAlert } = this.props;

        updating = true;
        const sand_obj = {};
        const alert_obj = {};

        if(type === 'payment_true') {
            // 입금 확인
            if(order_info.payment_state === 0) {
                update_qry['columns'].push({ 'key' : 'payment_state', 'value' : 1 });
                update_qry['columns'].push({ 'key' : 'payment_date', 'value' : null });
                update_qry['columns'].push({ 'key' : 'delivery_state', 'value' : 1 });

                if(order_info.order_type === 1) {
                    // 무통장 입금인 경우

                    // 상품 재고 및 판매량 최신화
                    await _setGoodsStock(order_info, 'remove');

                    // 포인트 적립
                    const acc_point = Math.floor(order_info.final_price * 0.01);
                    if(acc_point > 0) {
                        const point_comment = order_info.id + ' 번 주문 구매로 인한 포인트 적립 ( ' + acc_point + ' P )';
                        await _setPoint(acc_point, 'add', point_comment, order_info.user_id);
                    }
                }

            } else {
                allow_obj["allow"] = false;
                allow_obj["comment"] = '이미 결제가 완료된 주문입니다.';
            }

        } else if(type === 'order_complate') {
            if(order_info.payment_state === 1 && order_info.order_state === 1) {
                update_qry['columns'].push({ 'key' : 'order_state', 'value' : 2 });
                update_qry['columns'].push({ 'key' : 'order_complate_date', 'value' : null });

            } else {
                allow_obj["allow"] = false;

                if(order_info.payment_state !== 1) {
                    allow_obj["comment"] = '[결제 완료] 상태가 아닙니다.';

                } else if(order_info.order_state === 1) {
                    allow_obj["comment"] = '[주문 완료] 상태가 아닙니다.';
                }
            }
        } else if(type === 'order_cancel') {
            const reason = window.prompt('배송 취소 사유를 입력해주세요.');

            update_qry['columns'].push({ 'key' : 'order_state', 'value' : 3 });
            update_qry['columns'].push({ 'key' : 'cancel_date', 'value' : null });
            update_qry['columns'].push({ 'key' : 'cancel_reason', 'value' : reason });

            // 상품 재고 및 판매량 최신화
            await _setGoodsStock(order_info, 'add');

            // 적립 포인트 반환
            const acc_point = Math.floor(order_info.final_price * 0.01);
            if(acc_point > 0) {
                const point_comment = order_info.id + ' 번 주문 취소로 인한 적립 포인트 회수 ( ' + acc_point + ' P )';
                await _setPoint(acc_point, 'remove', point_comment, order_info.user_id);
            }

            // 사용 포인트 반환
            if(order_info.point_price > 0) {
                const point_comment = order_info.id + ' 번 주문 취소로 인한 사용 포인트 반환 ( ' + order_info.point_price + ' P )';
                await _setPoint(order_info.point_price, 'add', point_comment, order_info.user_id);
            }

            // 쿠폰 반환
            if(order_info.coupon_id && order_info.coupon_price > 0) {
                const search_coupon = { 'type' : 'UPDATE', 'table' : 'coupon', 'comment' : '쿠폰 반환하기' };

                search_coupon['columns'] = [];
                search_coupon['columns'].push({ 'key' : 'state', 'value' : 0 });
                search_coupon['columns'].push({ 'key' : 'cancel_date', 'value' : null });
        
                search_coupon['where'] = [];
                search_coupon['where'].push({ 'key' : 'use_order_id', 'value' : order_info.id });
    
                search_coupon['where_limit'] = 0;
                
                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : search_coupon
                })
            }

            if(order_info.info_agree === 1) {
                // 메일 전송하기
                const contents = `
                    안녕하세요, Sejun\'s Mall 입니다.
                    주문하신 [ ${order_info.order_title} ] 상품이 아래의 사유로 취소되었습니다.

                    사유　|　${reason}

                    불편을 드려 다시 한번 죄송합니다.
                `
                sand_obj['email'] = order_info.post_email;
                sand_obj['contents'] = contents;
                sand_obj['title'] = 'Sejun\'s Mall 주문 취소 메일입니다.';
            }

            const alert_reason = '[ ' + order_info.order_title + ' ] 상품이 관리자에 의해 취소되었습니다. <br /> 사유　|　' + reason

            alert_obj['user_id'] = order_info.user_id;
            alert_obj['reason'] = alert_reason;
            alert_obj['move_url'] = '/myPage/order_list';            

        } else if(type === 'start_delivery') {
            if(order_info.payment_state === 1 && order_info.delivery_state === 1 && (order_info.order_state === 1 || order_info.order_state === 2)) {
                update_qry['columns'].push({ 'key' : 'delivery_state', 'value' : 2 });
                update_qry['columns'].push({ 'key' : 'order_state', 'value' : 2 });
                update_qry['columns'].push({ 'key' : 'order_complate_date', 'value' : null });
                update_qry['columns'].push({ 'key' : 'delivery_start_date', 'value' : null });

                if(order_info.info_agree === 1) {
                    // 메일 전송하기
                    const contents = `
                        안녕하세요, Sejun\'s Mall 입니다.
                        주문하신 [ ${order_info.order_title} ] 상품에 대한 배송이 시작되었습니다.

                        저희 쇼핑몰을 이용해주셔서 감사합니다.
                    `
                    sand_obj['email'] = order_info.post_email;
                    sand_obj['contents'] = contents;
                    sand_obj['title'] = 'Sejun\'s Mall 배송 출발 메일입니다.';

                    const alert_reason = '[ ' + order_info.order_title + ' ] <br /> 상품의 배송이 시작되었습니다.'

                    alert_obj['user_id'] = order_info.user_id;
                    alert_obj['reason'] = alert_reason;
                    alert_obj['move_url'] = '/myPage/order_list';
                }

            } else {
                allow_obj["allow"] = false;

                if(order_info.payment_state !== 1) {
                    allow_obj["comment"] = '[결제 완료] 상태가 아닙니다.';

                } else if((order_info.order_state !== 1 || order_info.order_state !== 2)) {
                    allow_obj["comment"] = '[주문 완료 및 주문 확정] 상태가 아닙니다.';

                } else if(order_info.delivery_state !== 1) {
                    allow_obj["comment"] = '[배송 준비중] 상태가 아닙니다.';
                }
            }
            
        } else if(type === 'complate_delivery') {
            if(order_info.payment_state === 1 && order_info.delivery_state === 2 && (order_info.order_state === 1 || order_info.order_state === 2)) {
                update_qry['columns'].push({ 'key' : 'delivery_state', 'value' : 3 });
                update_qry['columns'].push({ 'key' : 'delivery_complate_date', 'value' : null });

                if(order_info.info_agree === 1) {
                    // 메일 전송하기
                    const contents = `
                        안녕하세요, Sejun\'s Mall 입니다.
                        주문하신 [ ${order_info.order_title} ] 상품이 도착했습니다.

                        저희 쇼핑몰을 이용해주셔서 감사합니다.
                    `

                    sand_obj['email'] = order_info.post_email;
                    sand_obj['contents'] = contents;
                    sand_obj['title'] = 'Sejun\'s Mall 상품 도착 메일입니다.';

                    const alert_reason = '[ ' + order_info.order_title + ' ] <br /> 상품의 배송이 도착했습니다..'

                    alert_obj['user_id'] = order_info.user_id;
                    alert_obj['reason'] = alert_reason;
                    alert_obj['move_url'] = '/myPage/order_list';
                }

            } else {
                allow_obj["allow"] = false;

                if(order_info.payment_state !== 1) {
                    allow_obj["comment"] = '[결제 완료] 상태가 아닙니다.';

                } else if((order_info.order_state !== 1 || order_info.order_state !== 2)) {
                    allow_obj["comment"] = '[주문 완료 및 주문 확정] 상태가 아닙니다.';

                } else if(order_info.delivery_state !== 2) {
                    allow_obj["comment"] = '[배송중] 상태가 아닙니다.';
                }
            }
        }

        if(allow_obj['allow'] === false) {
            alert(allow_obj['comment']);

        } else {
            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : update_qry
            });

            alert('업데이트 되었습니다.');

            if(order_info.info_agree === 1) {
                if(type === 'complate_delivery' || type === 'start_delivery' || type === 'order_cancel') {
                    _sendMailer(sand_obj);
                    _addAlert(alert_obj)
                }
            }
        }

        await this._getOrderList();

        window.setTimeout( () => {
            updating = false;
        }, 200)
        return;
    }

    render() {
        const { 
            admin_order_length, data_loading, price_comma, location, date_change, start_date, end_date,
            _filterURL, modal, _setModalStyle
        } = this.props;
        const { _addFilter, _getFilterOption, _selectDate, _deleteDate, _addViewFilter, _toggleModal, _closeModal, _stateUpdate } = this;
        const admin_order_info = JSON.parse(this.props.admin_order_info);

        let border_style = { 'borderTop' : 'solid 2px black', 'borderBottom' : 'solid 2px black' };
        if(admin_order_info.length === 0) {
            border_style = { 'borderTop' : 'dotted 1px #ababab', 'borderBottom' : 'dotted 1px #ababab' };
        }

        const cover_order_list = Object.values(order_list.order_list);
        const qry = queryString.parse(location.search);

        const filter_obj = _getFilterOption(qry, order_list.order_list)

        const moment = require('moment');
        const now_date = Date.parse(moment().format('YYYY-MM-DD'));

        const now_page = qry.order_page ? qry.order_page : this.props.now_page

        return(
            <div id='admin_order_div'>
                {data_loading === true
                    ? <div>

                        <form onSubmit={_addFilter}>
                        <div id='admin_order_filter_div'>
                            <div id='admin_order_filter_title_div' className='custom_color_1 font_12 bold aCenter'> 필터 적용 </div>

                            <div id='admin_order_filter_div_2' className='grid_half font_13'>
                                <div id='admin_order_filter_option_div aCenter'>
                                    {cover_order_list.map( (el, key) => {

                                        if(el.list && !el.hide) {
                                            const list = Object.values(el.list);

                                            return(
                                                <div className='admin_order_filter_grid_div' key={key}>
                                                    <div className={qry[el.type] ? 'admin_order_filter_title custom_color_2 bold' : 'admin_order_filter_title'}> 
                                                        {el.name}
                                                    </div>

                                                    <div>
                                                        <select name={el.type} className='admin_order_filter_selector'
                                                                defaultValue={qry[el.type]}
                                                        >   
                                                            <option value="none"> - </option>
                                                            {list.map( (cu, key2) => {
                                                                return(
                                                                    <option key={key2} value={cu.value}>
                                                                        {cu.name}
                                                                    </option>
                                                                )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>

                                <div id='admin_order_search_filter_div'>
                                    <div className='admin_order_filter_grid_div'> 
                                        <div className={qry.filter_order_id ? 'admin_order_filter_title custom_color_2 bold' : 'admin_order_filter_title'}> 
                                            주문 번호 
                                        </div>
                                        <div>
                                            <input type='number' name='filter_order_id' className='admin_order_search_input'
                                                    defaultValue={qry.filter_order_id}
                                            />
                                        </div>
                                    </div>

                                    <div className='admin_order_filter_grid_div'> 
                                        <div className={qry.filter_user_id ? 'admin_order_filter_title custom_color_2 bold' : 'admin_order_filter_title'}> 
                                            회원 아이디 
                                        </div>

                                        <div>
                                            <input type='text' name='filter_user_id' className='admin_order_search_input' 
                                                    defaultValue={qry.filter_user_id}
                                            />
                                        </div>
                                    </div>

                                    <div className='admin_order_filter_grid_div'> 
                                        <div className={qry.filter_order_min_price || qry.filter_order_max_price ? 'admin_order_filter_title custom_color_2 bold' : 'admin_order_filter_title'}> 
                                            결제 금액
                                        </div>
                                        <div>
                                            <input type='number' name='filter_order_min_price' className='admin_order_search_input' 
                                                    defaultValue={qry.filter_order_min_price} style={{ 'width' : '80px' }} min={0}
                                            />
                                            <u className='remove_underLine' style={{ 'padding' : '0px 5px 0px 5px' }}> 원 </u> ~　
                                            <input type='number' name='filter_order_max_price' className='admin_order_search_input' 
                                                    defaultValue={qry.filter_order_max_price} style={{ 'width' : '80px' }} min={0}
                                            />
                                            <u className='remove_underLine' style={{ 'padding' : '0px 5px 0px 5px' }}> 원 </u>
                                        </div>
                                    </div>

                                    <div className='admin_order_filter_grid_div'> 
                                        <div className={qry.filter_order_start_date || qry.filter_order_end_date ? 'admin_order_filter_title custom_color_2 bold' : 'admin_order_filter_title'}> 
                                            주문 일자
                                        </div>
                                        <div id='admin_order_filter_date_div'>
                                            <DatePicker className='admin_order_select_date pointer aCenter' name='filter_order_start_date' 
                                                selected={start_date} 
                                                // minDate={min_date} 
                                                maxDate={end_date}
                                                locale={ko} dateFormat="yyyy-MM-dd" autoComplete="off"
                                                // closeOnScroll={true}
                                                placeholderText="조회 시작 날짜" 
                                                onChange={(date) => _selectDate(date, 'start')}
                                                showPopperArrow={false} popperModifiers
                                            />

                                            　~　

                                            <DatePicker className='admin_order_select_date pointer aCenter' name='filter_order_end_date' 
                                                selected={end_date} minDate={start_date} maxDate={now_date}
                                                locale={ko} dateFormat="yyyy-MM-dd" autoComplete="off"
                                                // closeOnScroll={true}
                                                placeholderText="조회 종료 날짜" 
                                                onChange={(date) => _selectDate(date, 'end')}
                                                showPopperArrow={false} popperModifiers
                                            />

                                            {date_change
                                                ? <img src={icon.icon.close_black} alt='' id='admin_order_remove_date_icon' 
                                                    title='날짜를 검색 조건에서 제외합니다.' className='pointer'
                                                    onClick={_deleteDate}
                                                />

                                                : null
                                            }
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <input type='submit' value='통합 검색' id='admin_order_submit_button' className='pointer'/>
                        </form>

                        {Object.keys(filter_obj).length > 0
                        ?
                            <div id='admin_order_use_filter_div'>
                                <div id='admin_order_use_filter_title'> 
                                    적용중인 필터 
                                    <img onClick={() => window.location.href='/admin/order'}  id='admin_order_filter_reset_button' alt='' className='pointer' src={icon.icon.reload} /> 
                                </div>

                                <ul id='admin_order_use_filter_list_div'>
                                    {Object.keys(filter_obj).length > 0
                                        ? Object.entries(filter_obj).map( (el, key3) => {
                                            return(
                                                <li key={key3}>
                                                    {el[1].name}　|　{el[1].value}
                                                    <img alt='' src={icon.icon.close_circle} className='admin_order_filter_remove_icon' onClick={(event) => _addFilter(event, el[0])} />
                                                </li>
                                            )
                                        })
                                    
                                        : null
                                    }
                                </ul>
                            </div>

                        : null}

                        <div id='admin_order_view_filter_div' className='aRight'>
                            <div className={ qry.view_option === 'lately' ? 'bold custom_color_1' : null }> 
                                <u onClick={() => _addViewFilter('view_option', 'lately')}> 최신순 </u> 
                            </div>

                            <div className={ qry.view_option === 'past' ? 'bold custom_color_1 admin_order_view_filter_block' : 'admin_order_view_filter_block' }> 
                                <u onClick={() => _addViewFilter('view_option', 'past')}> 과거순 </u> 
                            </div>

                            <div className={ qry.view_option === 'higher' ? 'bold custom_color_1' : null }> 
                                <u onClick={() => _addViewFilter('view_option', 'higher')}> 가격 높은 순 </u> 
                            </div>

                            <div className={ qry.view_option === 'lower' ? 'bold custom_color_1' : null }> 
                                <u onClick={() => _addViewFilter('view_option', 'lower')}> 가격 낮은 순 </u> 
                            </div>
                        </div>
                        
                        <div id='admin_order_contents_div'>

                            <div className='admin_order_paging_div' style={{ 'paddingBottom' : '50px' }}>
                                <Paging
                                    paging_cnt={admin_order_length}
                                    paging_show={20}
                                    now_page={now_page}
                                    page_name='order_page' 
                                    _filterURL={_filterURL}
                                    qry={qry}
                                />
                            </div>

                            <div id='admin_order_info_length_div' className='font_12 bold'>
                                <p> 총 {admin_order_length} 개의 주문 정보를 조회했습니다. </p>
                            </div>

                            <div style={border_style}>
                                {admin_order_info.length > 0
                                    ? <div id='admin_order_contents_list_div'>
                                        {admin_order_info.map( (el, key) => {
                                            let border_style = {};
                                            if(key + 1 < admin_order_info.length) {
                                                border_style['borderBottom'] = 'solid 2px #ababab';
                                            }

                                            if(key % 2 === 0) {
                                                border_style['backgroundColor'] = 'aliceblue'
                                            }

                                            let order_state = '<b class="gray"> 주문 대기 </b>';
                                            if(el.order_state === 1) {
                                                order_state = '<b> 주문 완료 </b>';

                                            } else if(el.order_state === 2) {
                                                order_state = '<b class="custom_color_1"> 주문 확정 </b>';

                                            } else if(el.order_state === 3) {
                                                order_state = '<b class="red"> 주문 취소 </b>';
                                            }

                                            let order_type = '<u class="remove_underLine">'
                                            if(el.order_type === 0) {
                                                order_type += '-';

                                            } else if(el.order_type === 1) {
                                                order_type += '무통장 입금';

                                            } else if(el.order_type === 2) {
                                                order_type += '카드 결제';

                                            } else if(el.order_type === 3) {
                                                order_type += '포인트 & 쿠폰'
                                            }
                                            order_type += '</u>'

                                            let payment_state = '';
                                            if(el.payment_state === 0) {
                                                payment_state = '<u class="remove_underLine gray"> 결제 전 </u>';
                                                
                                            } else if(el.payment_state === 1) {
                                                payment_state = '<b> 결제 완료 </b>';
                                            }

                                            let delivery_state = '';
                                            if(el.delivery_state === 0) {
                                                delivery_state = '<u class="remove_underLine gray"> 배송 없음 </u>';

                                            } else if(el.delivery_state === 1) {
                                                delivery_state = '<u class="remove_underLine"> 배송 준비중 </u>';

                                            } else if(el.delivery_state === 2) {
                                                delivery_state = '<u class="bold"> 배송중 </u>';

                                            } else if(el.delivery_state === 3) {
                                                delivery_state = '<b class="bold custom_color_1"> 배송 완료 </b>';
                                            }

                                            return(
                                                <div className='admin_order_list_div' key={key} style={border_style}>
                                                    <div className='admin_order_other_div font_12 pointer'
                                                        onClick={() => _toggleModal(el)}
                                                    >
                                                        <div> 
                                                            {/* <input id={'admin_order_checkbox_' + el.id} type='checkbox' className='pointer' />   */}
                                                            <label htmlFor={'admin_order_checkbox_' + el.id}> No. {el.id} </label>
                                                        </div>

                                                        <div title='유저 아이디'> {el.order_user_id} </div>
                                                        <div title='주문 종류' dangerouslySetInnerHTML={{ __html : order_type }} />
                                                        <div title='주문 상태' dangerouslySetInnerHTML={{ __html : order_state }} />
                                                        <div title='결제 상태' dangerouslySetInnerHTML={{ __html : payment_state }} />
                                                        <div title='배송 상태' dangerouslySetInnerHTML={{ __html : delivery_state }} />
                                                        <div title='주문 일자' className='aCenter'> {el.create_date.slice(0, 16)} </div>
                                                        <div className='aRight gray'> <u className='remove_underLine' onClick={() => _toggleModal(el)}> 상세 보기 ▷ </u> </div>
                                                    </div>

                                                    <div className='admin_order_goods_info_div'>
                                                        <div className='grid_half'>
                                                            <div className='admin_order_title_div recipe_korea font_14' dangerouslySetInnerHTML={{ __html : el.order_title }} />

                                                            <div className='admin_order_other_button_div aRight'>
                                                                <div> 
                                                                    <input type='button' value='결제 완료' 
                                                                        className={el.payment_state === 0 && el.order_state === 1 ? 'order_other_able' : 'order_other_disable'}
                                                                        onClick={() => el.payment_state === 0 && el.order_state === 1 
                                                                            ? _stateUpdate(el.id, 'payment_true')
                                                                            : null
                                                                        }
                                                                    /> 
                                                                </div>

                                                                <div> 
                                                                    <input type='button' value='주문 확정' 
                                                                        className={el.payment_state === 1 && el.order_state === 1 ? 'order_other_able' : 'order_other_disable'}
                                                                        onClick={() => el.payment_state === 1 && el.order_state === 1
                                                                            ? _stateUpdate(el.id, 'order_complate')
                                                                            : null
                                                                        }
                                                                    /> 
                                                                </div>

                                                                <div> 
                                                                    <input type='button' value='주문 취소' 
                                                                        className={el.payment_state === 1 && el.delivery_state === 1 && (el.order_state === 1 || el.order_state === 2) ? 'order_other_able' : 'order_other_disable'}
                                                                        onClick={() => el.payment_state === 1 && el.delivery_state === 1 && (el.order_state === 1 || el.order_state === 2)
                                                                            ? _stateUpdate(el.id, 'order_cancel')
                                                                            : null
                                                                        }
                                                                   /> 
                                                                </div>

                                                                <div> 
                                                                    <input type='button' value='배송 출발' 
                                                                        className={el.payment_state === 1 && el.delivery_state === 1 && (el.order_state === 1 || el.order_state === 2) ? 'order_other_able' : 'order_other_disable'}
                                                                        onClick={() => el.payment_state === 1 && el.delivery_state === 1 && (el.order_state === 1 || el.order_state === 2)
                                                                            ? _stateUpdate(el.id, 'start_delivery')
                                                                            : null
                                                                        }
                                                                    /> 
                                                                </div>

                                                                <div> 
                                                                    <input type='button' value='배송 완료' 
                                                                        className={el.payment_state === 1 && el.delivery_state === 2 && (el.order_state === 1 || el.order_state === 2)
                                                                            ? 'order_other_able' : 'order_other_disable'}

                                                                        onClick={() => el.payment_state === 1 && el.delivery_state === 2 && (el.order_state === 1 || el.order_state === 2)
                                                                            ? _stateUpdate(el.id, 'complate_delivery')
                                                                            : null
                                                                        }
                                                                    /> 
                                                                
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='admin_order_payment_info font_14'>
                                                            <div className='border_right_dotted'> 
                                                                <div style={{ 'backgroundColor' : '#f4f9f9' }} className='admin_order_payment_title_div'> 원가 </div>
                                                                <div className='admin_order_payment_contents_div'> {price_comma(el.origin_price)} 원 </div>
                                                            </div>

                                                            <div className='border_right_dotted'> 
                                                                <img alt='' src={icon.icon.minus} className='admin_order_minus_icon' /> 
                                                                <p className='admin_order_payment_result_div font_11 gray'> {price_comma(el.discount_price)} 원 </p>
                                                            </div>

                                                            <div className='border_right_dotted'> 
                                                                <div style={{ 'backgroundColor' : '#d3e0dc' }} className='admin_order_payment_title_div'> 할인 적용가 </div>
                                                                <div className='admin_order_payment_contents_div'> {price_comma(el.origin_price - el.discount_price)} 원 </div>
                                                            </div>

                                                            <div className='border_right_dotted'> 
                                                                <img alt='' src={icon.icon.plus} className='admin_order_minus_icon' /> 
                                                                <p className='admin_order_payment_result_div font_11 gray'> {price_comma(el.delivery_price)} 원 </p>
                                                            </div>

                                                            <div className='border_right_dotted'> 
                                                                <div style={{ 'backgroundColor' : '#a3d2ca' }} className='admin_order_payment_title_div'> 배송비 적용가 </div>
                                                                <div className='admin_order_payment_contents_div'> {price_comma((el.origin_price - el.discount_price) + el.delivery_price)} 원 </div>
                                                            </div>

                                                            <div className='border_right_dotted'> 
                                                                <img alt='' src={icon.icon.minus} className='admin_order_minus_icon' /> 
                                                                <p className='admin_order_payment_result_div font_11 gray'> 
                                                                    {price_comma(el.point_price + el.coupon_price)}원 
                                                                </p>
                                                            </div>

                                                            <div> 
                                                                <div style={{ 'backgroundColor' : '#6f9eaf' }} className='admin_order_payment_title_div'> 쿠폰 & 포인트 적용가 </div>
                                                                <div className='admin_order_payment_contents_div'> { price_comma(((el.origin_price - el.discount_price) + el.delivery_price) - (el.point_price + el.coupon_price))} 원 </div>
                                                            </div>
                                                        </div> 

                                                        <div className='admin_order_final_price_div bold paybook_bold'>
                                                            <div> 최종 결제가 </div>
                                                            <div> {price_comma(el.final_price)} 원</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        <Modal
                                            isOpen={modal}
                                            onRequestClose={_closeModal}
                                            style={_setModalStyle('360px', '1000px')}
                                        >
                                            <OrderDetail 
                                                _getFilterOption={_getFilterOption}
                                                price_comma={price_comma}
                                                _closeModal={_closeModal}
                                            />
                                        </Modal>

                                        {admin_order_info.length > 7 ?
                                        <div className='admin_order_paging_div' style={{ 'padding' : '40px 0px 60px 0px' }}>
                                            <Paging
                                                paging_cnt={admin_order_length}
                                                paging_show={20}
                                                now_page={now_page}
                                                page_name='order_page' 
                                                _filterURL={_filterURL}
                                                qry={qry}
                                            />
                                        </div>

                                        : null}
                                        
                                      </div>
            

                                    : <div className='admin_data_empty_div aCenter'>
                                        <h3> 상품 데이터가 없습니다. </h3>
                                    </div>
                                }
                            </div>
                        </div>
                      </div>

                    : <div className='admin_data_loading_div aCenter'>
                        <h4> 데이터를 불러오고 있습니다. </h4>
                      </div>
                }
            </div>
        )
    }
}

AdminOrder.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code,
        admin_order_info : state.admin.admin_order_info,
        admin_order_length : state.admin.admin_order_length,
        data_loading : state.admin.data_loading,
        start_date : state.admin.start_date,
        end_date : state.admin.end_date,
        date_change : state.admin.date_change,
        now_page : state.admin.now_page,
        modal : state.config.modal
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch),
        configAction : bindActionCreators(configAction, dispatch),
    })
  )(AdminOrder);