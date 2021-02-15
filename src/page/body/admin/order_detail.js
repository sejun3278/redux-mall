import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import * as configAction from '../../../Store/modules/config';
import '../../../css/responsive/admin.css';

// import $ from 'jquery';
import URL from '../../../config/url';
import icon from '../../../source/img/icon.json';

class AdminOrderDetail extends Component {

    componentDidMount() {
        const { configAction } = this.props;
        const admin_detail_info = JSON.parse(this.props.admin_detail_info);

        if(admin_detail_info.id === null) {
            alert('주문 데이터를 불러올 수 없습니다.');
            configAction.toggle_modal({ 'bool' : false });

        } else {
            this._getOrderInfo(admin_detail_info)
        }
    }

    // 주문 정보 가져오기
    _getOrderInfo = async (info) => {
        const { adminAction } = this.props;

        const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '주문 정보 가져오기' }

        obj['join'] = true;
        obj['join_table'] = 'order_info'

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'order_id', 'key2' : 'id' }

        obj['join_where'] = '*';

        obj['option'] = {};
        obj['option']['id'] = '=';
        obj['option']['user_id'] = '=';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'order', 'key' : 'id', 'value' : info.id })
        obj['where'].push({ 'table' : 'order', 'key' : 'user_id', 'value' : info.user_id })

        const get_order_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });
        const order_data = get_order_data.data[0][0];

        const cover_cart_list = JSON.parse(order_data.cart_list);

        // 상품 정보 가져오기
        const get_goods_qry = { 'type' : 'SELECT' };
        let result_data;

        if(typeof cover_cart_list === 'object') {
            // 여러 상품들이 담겨있는 경우

            get_goods_qry['table'] = 'cart';
            get_goods_qry['comment'] = '(여러) 상품 데이터 가져오기';
            
            get_goods_qry['join'] = true;
            get_goods_qry['join_table'] = 'goods';

            get_goods_qry['join_arr'] = [];
            get_goods_qry['join_arr'][0] = { 'key1' : 'id', 'key2' : 'goods_id' }
    
            get_goods_qry['join_where'] = [];
            get_goods_qry['join_where'].push({ 'columns' : 'thumbnail', 'as' : 'goods_thumbnail' });
            get_goods_qry['join_where'].push({ 'columns' : 'name', 'as' : 'goods_name' });
            get_goods_qry['join_where'].push({ 'columns' : 'id', 'as' : 'goods_id' });

            get_goods_qry['option'] = {};
            get_goods_qry['option']['id'] = '=';

            get_goods_qry['where'] = [];    

            let cover_arr = [];
            const get_cart_list_map = async (limit) => {
                get_goods_qry['where'][0] = { 'table' : 'cart', 'key' : 'id', 'value' : cover_cart_list[limit] };

                const get_data = await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : get_goods_qry
                });

                cover_arr.push(get_data.data[0][0]);
                
                limit += 1;
                if(cover_cart_list.length === limit) {
                    return cover_arr;
                }

                return get_cart_list_map(limit);
            }

            result_data = await get_cart_list_map(0);

        } else {
            // 단일 구매일 경우
            get_goods_qry['table'] = 'goods';
            get_goods_qry['comment'] = '(단일) 상품 데이터 가져오기';

            get_goods_qry['option'] = {};
            get_goods_qry['option']['id'] = '=';

            get_goods_qry['where'] = [];
            get_goods_qry['where'].push({ 'table' : 'goods', 'key' : 'id', 'value' : cover_cart_list });

            const get_cart_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : get_goods_qry
            });
            const goods_info = get_cart_data.data[0][0];

            goods_info['num'] = order_data.goods_num;
            result_data = [goods_info];
        }

        // order_data['goods_thumbnail'] = goods_data.thumbnail;
        // order_data['goods_name'] = goods_data.name;


        adminAction.save_admin_order_data({ 
            'order_detail_info' : JSON.stringify(order_data),
            'order_goods_info' : JSON.stringify(result_data),
            'bool' : true
        })
    }

    render() {
        const { _getFilterOption, price_comma, admin_order_loading, _closeModal } = this.props;

        const info = JSON.parse(this.props.admin_detail_info);
        const detail_info = JSON.parse(this.props.admin_order_detail_info);
        const goods_info = JSON.parse(this.props.admin_order_goods_info);

        const opt_obj = {};
        opt_obj['filter_order_type'] = info.order_type;
        opt_obj['filter_order_state'] = info.order_state;
        opt_obj['filter_payment_state'] = info.payment_state;
        opt_obj['filter_delivery_state'] = info.delivery_state;

        const order_state = _getFilterOption(opt_obj);

        return(
            <div id='admin_order_deatil_div'>
                <div id='admin_order_detail_title_div'>
                    <h4 className='aCenter'> 주문 상세사항 </h4>
                    <img src={icon.icon.close_black} alt='' id='admin_order_deatil_close_button' className='pointer' 
                        onClick={_closeModal}
                    />
                </div>

                {admin_order_loading === true

                ?

                <div id='admin_order_detail_contents_div' className='grid_half'>
                    <div className='admin_order_detail_block_div'
                        style={{ 'borderRight' : 'dotted 1px #ababab', 'borderBottom' : 'dotted 1px #ababab' }}
                    >
                        <h4 className='admin_order_detail_title_div custom_color_1'> 주문 정보 </h4>

                        <div className='admin_order_detail_info_div font_12'>
                            <div className='grid_half'>
                                <div> 주문 번호　|　<u> {info.id} </u> </div>
                                <div> 주문 일자　|　<u> {info.create_date.slice(0, 16)} </u> </div>
                                <div> 주문 회원　|　<u> {info.order_user_id} </u> </div>
                                <div> 주문 코드　|　<u> {info.code} </u> </div>
                            </div>

                            <div className='grid_half'>
                                {Object.entries(order_state).map( (el, key) => {
                                    return(
                                        <div key={key}>
                                            {el[1].name}　|　
                                            <u> {el[1].value} </u>
                                        </div>
                                    )
                                })}
                            </div>

                            <div id='admin_order_detail_other_div'>
                                {info.order_state === 3
                                    ? <div>
                                        <div> 취소 일자　|　{info.cancel_date.slice(0, 16)} </div>
                                        <div> 취소 사유　|　{info.cancel_reason } </div>
                                      </div>

                                    : null
                                }

                                {info.order_state === 2 || (info.delivery_state === 2 || info.delivery_state === 3)
                                    ? <div className='grid_half'>
                                        <div> 확정 일자　|　{info.order_complate_date.slice(0, 16)} </div>
                                        {info.delivery_state === 2
                                            ? <div> 배송 출발　|　<b className='black'> {info.delivery_start_date.slice(0, 16)} </b> </div>

                                            : info.delivery_state === 3

                                                ? <div> 배송 도착　|　<b className='custom_color_1'> {info.delivery_complate_date.slice(0, 16)} </b> </div>

                                                : null
                                        }
                                      </div>

                                    : null
                                }

                                <div className='grid_half'>
                                    <div>　</div>
                                    <div> 적립 포인트　|　<b> {price_comma(Math.floor(info.final_price * 0.01))} P </b> </div>
                                </div>
                            </div>
                        </div>

                        {/* <div id='admin_order_detail_final_price_div'>
                            <div id='admin_order_detail_final_price_title'> 총 결제 금액 </div>
                            <div className='recipe_korea' style={{ 'paddingLeft' : '20px' }}> <b> {price_comma(info.final_price)} 원 </b> </div>
                        </div> */}
                    </div>

                    <div className='admin_order_detail_block_div'
                        style={{ 'borderBottom' : 'dotted 1px #ababab' }}
                    >
                        <h4 className='admin_order_detail_title_div custom_color_1'> 주문인 정보 </h4>
                            <div className='admin_order_detail_info_div font_12'>
                                <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 주문인　|　</div> <div> <u> {detail_info.get_user_name} </u> </div> </div>
                                <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 우편 주소　|　</div> <div> <u> {detail_info.get_host_code} </u> </div> </div>
                                <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 상세 주소　|　</div> <div> <u> {detail_info.get_host} {detail_info.get_host_detail} </u> </div> </div>
                                <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 전화번호　|　</div> <div> <u> {detail_info.get_phone} </u> </div> </div>
                                
                                {detail_info.delivery_message
                                    ? <div className='admin_order_detail_info_grid_div'>
                                        <div className='aRight'> 배송 메세지　|　</div>
                                        <div> <u> {detail_info.delivery_message} </u> </div>
                                      </div>

                                    : null
                                }
                            </div>
                        <div>

                        </div>
                    </div>

                    <div className='admin_order_detail_block_div'
                        style={{ 'borderRight' : 'dotted 1px #ababab' }}
                    >
                        <h4 className='admin_order_detail_title_div custom_color_1'> 상품 정보 </h4>

                        <div id='admin_order_detail_goods_info_div'>
                            {goods_info.map( (el, key) => {
                                const thumbnail = el.thumbnail ? el.thumbnail : el.goods_thumbnail
                                const goods_id = el.goods_id ? el.goods_id : el.id;
                                const goods_name = el.goods_name ? el.goods_name : el.name;

                                const goods_num = el.goods_num ? el.goods_num : el.num;
                                
                                let goods_price = 0;
                                if(goods_info.length > 1) {
                                    goods_price = el.price * goods_num;

                                } else {
                                    goods_price = el.result_price * goods_num;
                                }

                                return(
                                    <div key={key} className='admin_order_datail_goods_list_div'
                                        style={ goods_info.length > key + 1 ? { 'borderBottom' : 'dotted 1px #ababab' } : null }
                                    >
                                        <div className='admin_order_detail_goods_thumbnail_div'
                                            style={{ 'backgroundImage' : `url(${thumbnail})` }}
                                        />

                                        <div className='admin_order_detail_goods_info_div'>
                                            <div className='admin_order_detail_goods_id_div font_12'>
                                                <div> 상품 번호　|　{goods_id} </div>
                                            </div>

                                            <div className='admin_order_detail_goods_name_and_price_div'>
                                                <div className='admin_order_detail_goods_name_div bold recipe_korea font_14'>
                                                    {goods_name}
                                                </div>

                                                <div className='admin_order_detail_price_div font_12 gray'>
                                                    {goods_num} 개　|　{price_comma(goods_price)} 원
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div id='admin_order_detail_final_price_div'>
                            <div className='admin_order_datail_final_price_grid_div'> 
                                <div className='aRight'> 결제 예상가　|　</div>
                                <div> {price_comma(info.result_price)} 원 </div>
                            </div>

                            <div className='admin_order_datail_final_price_grid_div'
                                style={info.coupon_price + info.point_price === 0 ? { 'color' : '#ababab' } : null}
                            > 
                                <div className='aRight'> 포인트 & 쿠폰 할인　|　</div>
                                <div> - {price_comma(info.coupon_price + info.point_price)} 원 </div>
                            </div>

                            <div className='admin_order_datail_final_price_grid_div bold white'
                                style={{ 'backgroundColor' : 'black' }}
                            > 
                                <div className='aRight'> 최종 결제가　|　</div>
                                <div> {price_comma(info.final_price)} 원 </div>
                            </div>
                        </div>
                    </div>

                    <div className='admin_order_detail_block_div'>
                        <h4 className='admin_order_detail_title_div custom_color_1'> 배송지 정보 </h4>
                                
                        <div className='admin_order_detail_info_div font_12'>
                            <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 수취인　|　</div> <div> <u> {detail_info.post_name} </u> </div> </div>
                            <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 이메일　|　</div> <div> <u> {detail_info.post_email} </u> </div> </div>
                            <div className='admin_order_detail_info_grid_div'> <div className='aRight'> 전화번호　|　</div> <div> <u> {detail_info.post_phone} </u> </div> </div>
                        </div>
                    </div>
                </div>

                : <div id='admin_order_detail_loading_div' className='aCenter'>
                    <h4> 데이터를 조회하고 있습니다. </h4>  
                  </div>
                 }
            </div>
        )
    }
}

AdminOrderDetail.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_detail_info : state.admin.admin_detail_info,
        admin_order_detail_info : state.admin.admin_order_detail_info,
        admin_order_goods_info : state.admin.admin_order_goods_info,
        admin_order_loading : state.admin.admin_order_loading
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch),
        configAction : bindActionCreators(configAction, dispatch),
    })
  )(AdminOrderDetail);