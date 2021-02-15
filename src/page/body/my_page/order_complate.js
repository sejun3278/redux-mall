import React, { Component } from 'react';
import axios from 'axios';
import URL from '../../../config/url';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';
import * as orderAction from '../../../Store/modules/order';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

class Order_complate extends Component {

    async componentDidMount() {
        const { _getCookie, user_info, orderAction, _hashString } = this.props;
        const get_order_cookie = JSON.parse(await _getCookie('order_complate', 'get', null, true));
        // const get_session = JSON.parse(sessionStorage.getItem(_hashString('order_complate')));

        let acess_able = true;
        if(get_order_cookie) {
            const session_user_id = get_order_cookie[_hashString('user_id')];
            const session_order_id = get_order_cookie[_hashString('order_id')];

            const session_id_check = session_user_id === _hashString(String(user_info.id));
            const session_order_check = session_order_id === _hashString(String(get_order_cookie.order_id));

            if(!get_order_cookie) {
                acess_able = false;
    
            } else {
                if(session_id_check === false || session_order_check === false) {
                    acess_able = false;
    
                } else {
                    const check_obj = { 'type' : 'SELECT', 'table' : 'order', 'join' : true, 'join_table' : 'order_info', 'comment' : '주문 정보 체크하기' };
    
                    if(check_obj['join'] === true) {
                        check_obj['join_arr'] = [];
                        check_obj['join_arr'][0] = { 'key1' : 'order_id', 'key2' : 'id' }
            
                        check_obj['join_where'] = [];
                        check_obj['join_where'].push({ 'columns' : 'final_price', 'as' : 'order_final_price' });
                        check_obj['join_where'].push({ 'columns' : 'create_date', 'as' : 'order_complate_date' });
                        check_obj['join_where'].push({ 'columns' : 'get_user_name', 'as' : 'get_user_name' });
                        check_obj['join_where'].push({ 'columns' : 'get_host_code', 'as' : 'get_host_code' });
                        check_obj['join_where'].push({ 'columns' : 'get_host', 'as' : 'get_host' });
                        check_obj['join_where'].push({ 'columns' : 'get_host_detail', 'as' : 'get_host_detail' });
                        check_obj['join_where'].push({ 'columns' : 'get_phone', 'as' : 'get_phone' });
                        check_obj['join_where'].push({ 'columns' : 'delivery_message', 'as' : 'delivery_message' });
                        check_obj['join_where'].push({ 'columns' : 'post_name', 'as' : 'post_name' });
                        check_obj['join_where'].push({ 'columns' : 'post_email', 'as' : 'post_email' });
                        check_obj['join_where'].push({ 'columns' : 'post_phone', 'as' : 'post_phone' });
                    }
    
                    check_obj['option'] = {};
                    check_obj['option']['user_id'] = '=';
                    check_obj['option']['id'] = '=';
            
                    check_obj['where'] = [];
                    check_obj['where'].push({ 'table' : 'order', 'key' : 'user_id', 'value' : user_info.id });
                    check_obj['where'].push({ 'table' : 'order', 'key' : 'id', 'value' : get_order_cookie.order_id });
    
                    const get_data = await axios(URL + '/api/query', {
                        method : 'POST',
                        headers: new Headers(),
                        data : check_obj
                    })
    
                    const data = get_data.data[0][0];
    
                    const save_order_obj = {};
                    save_order_obj['order_info'] = JSON.stringify(data);
                    save_order_obj['cart_data'] = JSON.stringify(get_order_cookie.cart_list);
                    save_order_obj['loading'] = true;
    
                    orderAction.save_order_info(save_order_obj);
                }
            }

        } else {
            acess_able = false;
        }

        if(acess_able === false) {
            alert('허용되지 않는 접근입니다.');
            return window.location.replace('/');
        }
    }

    render() {
        const { order_loading, price_comma } = this.props;
        const order_info = JSON.parse(this.props.order_info);
        const cart_data = JSON.parse(this.props.cart_data);

        const order_type = order_info.order_type;
        const order_title = order_type === 1 ? '주문 완료' : '결제 완료';
        const order_comment = order_type === 1 ? '[ 농협 - ] 으로 입금해주시길 바랍니다.' : null;

        let payment_type = '';
        let payment_state = '결제 완료';
        let bank_pay_comment = '';

        if(order_type === 1) {
            payment_type = '무통장 입금';
            payment_state = '결제 전';
            bank_pay_comment = '( [ 농협 - ] 입금 바람 )'

        } else if(order_type === 2) {
            payment_type = '카드 결제';

        } else if(order_type === 3) {
            payment_type = '쿠폰 & 포인트 결제';
        }   

        const prediction_point = Math.trunc((order_info.result_price - order_info.delivery_price) * 0.01);
        
        return(
            <div id='order_complate_div'>
                {order_loading === true ?
                <div>
                    <h2 className='paybook_bold aCenter' id='order_complate_title_div'> {order_title} </h2>
                    <p id='order_complate_comment_div' className='aCenter bold'> {order_comment} </p>

                    <div id='order_complate_other_contets_div' className='grid_half font_13 aCenter bold gray marginTop_30'>
                        <div> <b className='pointer' onClick={() => window.location.replace('/')}> ◁ 홈으로 </b> </div>
                        <div> <b className='pointer' onClick={() => window.location.replace('/myPage/order_list')}> ◁ 주문 / 배송 현황 </b> </div>
                    </div>
                
                    <div id='order_complate_cart_list_div'>
                        <h3 className='order_title_div'> 상품 리스트 </h3>
                        {cart_data.map( (el, key) => {
                            const goods_name = el.name ? el.name : el.goods_name;
                            const num = el.num ? el.num : order_info.goods_num;
                            const result_price = order_info.goods_num ? el.result_price : el.goods_result_price;

                            return(
                                <div key={key} className='order_complate_cart_list'>
                                    <div style={{ 'backgroundImage' : `url(${el.thumbnail})` }} className='order_complate_thumbnail_div' />
                                    <div className='order_complate_list_contents_div'>  
                                        <div className='order_complate_list_contents_name bold recipe_korea cut_multi_line'> {goods_name} </div>
                                        <div className='order_complate_price_div gray font_13'> 
                                            {price_comma(num)} 개　|　{price_comma(result_price * num)} 원
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div id='order_complate_payment_div' className='order_complate_divs'>
                        <h3 className='order_title_div'> 결제 내역 </h3>
                        
                        <div id={order_info.coupon_price > 0 || order_info.point_price > 0 ? 'order_complate_payment_grid_div' : null}>
                            {order_info.coupon_price > 0 || order_info.point_price > 0
                            ?
                            <div className='order_complate_payment_other_div'>
                                <h4 className='t_money_font'> 예상 결제가 </h4>
                                <div className='order_complate_price_contents_div'> {price_comma(order_info.result_price)} 원 </div>
                            </div>

                            : null}

                            {order_info.coupon_price > 0 || order_info.point_price > 0
                            ?
                            <div className='order_complate_payment_other_div' id='order_complate_discount_price_div'>
                                <h4 className='t_money_font'> 할인 금액 </h4>
                                <div className='order_complate_price_contents_div' id='order_complate_discount_div'
                                    style={ order_info.coupon_price === 0 || order_info.point_price === 0 ? { 'lineHeight' : '55px' } : null }
                                >

                                    {order_info.coupon_price > 0
                                    ?
                                    <div className='order_complate_price_grid_div'>
                                        <div> 쿠폰 </div>
                                        <div> { price_comma(order_info.coupon_price) + ' 원' } </div>
                                    </div>

                                    : null }

                                    {order_info.point_price > 0
                                    ?
                                    <div className='order_complate_price_grid_div'>
                                        <div> 포인트 </div>
                                        <div> {price_comma(order_info.point_price) + ' 원'} </div>
                                    </div>

                                    : null }
                                </div>
                            </div>

                            : null}

                            <div className='order_complate_payment_other_div' id={!order_info.coupon_price > 0 && !order_info.point_price > 0 ? 'order_complate_only_final_price' : null}>
                                <h4 className='t_money_font'> 최종 결제가 </h4>
                                <div className='order_complate_price_contents_div bold font_16'> {price_comma(order_info.final_price)} 원 </div>
                            </div>
                        </div>
                    </div>

                    <div id='order_complate_info_div' className='order_complate_divs'
                    >
                        <h3 className='order_title_div'> 주문 상세 내역 </h3>

                        <div id='order_complate_contents_div' className='font_14'>
                            <div className='order_complate_num_div'>
                                <div className='order_complate_contents_grid_div'>
                                    <div className='order_complate_contents_grid_div_name'> 주문 번호 　|　</div>
                                    <div className='order_complate_contents_show_div'> {order_info.id} </div>
                                </div>

                                <div className='order_complate_contents_grid_div'>
                                    <div className='order_complate_contents_grid_div_name'> 주문 일자 　|　</div>
                                    <div className='order_complate_contents_show_div'> {order_info.buy_date.slice(0, 10) + '　' + order_info.buy_date.slice(10, 20)} </div>
                                </div>
                            </div>

                            <div className='order_complate_contents_grid_div'>
                                <div className='order_complate_contents_grid_div_name'> 주문 내용 　|　</div>
                                <div className='order_complate_contents_show_div'> {order_info.order_title} </div>
                            </div>

                            <div className='order_complate_num_div'>
                                <div className='order_complate_contents_grid_div'>
                                    <div className='order_complate_contents_grid_div_name'> 결제 방식 　|　</div>
                                    <div className='order_complate_contents_show_div'> {payment_type} </div>
                                </div>

                                {prediction_point > 0 
                                ? 
                                <div className='order_complate_contents_grid_div'>
                                    <div className='order_complate_contents_grid_div_name'> 적립 예정 　|　</div>
                                    <div className='order_complate_contents_show_div bold' style={{ 'color' : '#35c5f0' }}> {price_comma(prediction_point)} P </div>
                                </div>

                                : null}
                            </div>

                            <div className='order_complate_contents_grid_div'>
                                <div className='order_complate_contents_grid_div_name'> 결제 여부 　|　</div>
                                <div className='order_complate_contents_show_div'> 
                                    {payment_state} 
                                    <u id='bank_pay_comment'> {bank_pay_comment} </u> 
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='order_complate_divs'>
                        <h3 className='order_title_div'> 배송지 정보 </h3>
                                    
                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 배송 수령인　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.get_user_name} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 배송지 주소 　|　</div>
                            <div className='order_complate_contents_show_div'> [ {order_info.get_host_code} ] </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 　 </div>
                            <div className='order_complate_contents_show_div'> {order_info.get_host} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 　 </div>
                            <div className='order_complate_contents_show_div'> {order_info.get_host_detail} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 전화번호 　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.get_phone} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 배송 메세지 　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.delivery_message} </div>
                        </div>

                    </div>

                    <div className='order_complate_divs'>
                        <h3 className='order_title_div'> 주문인 정보 </h3>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 주문인　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.post_name} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 이메일　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.post_email} </div>
                        </div>

                        <div className='order_complate_contents_grid_div'>
                            <div className='order_complate_contents_grid_div_name'> 전화번호　|　</div>
                            <div className='order_complate_contents_show_div'> {order_info.post_phone} </div>
                        </div>
                    </div>
                </div>

                : null}
            </div>
        )
    }
}

Order_complate.defaultProps = {
    // coupon_loading : false
  }
  
  export default connect(
    (state) => ({
        order_info : state.order.order_info,
        cart_data : state.order.cart_data,
        order_loading : state.order.order_loading
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch)
    })
  )(Order_complate);