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
import Coupon_list from '../my_page/coupon_list';

import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';
  
Modal.setAppElement('body');

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


        } else {
            if(acess['alert'] !== null) {
                alert(acess['alert']);
            }
            window.location.replace('/');
        }
    }

    _checkAcess = async () => {
        const { user_info, _getCookie, myPageAction } = this.props;
        const cookie_check = await _getCookie("order", "get");

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

            this._saveData(query_result.data[0][0]);
        }

        // 쿠폰 설정하기
        const coupon_obj = {};

        if(cookie_check.coupon) {
            coupon_obj['obj'] = JSON.stringify(cookie_check.coupon);
            coupon_obj['cover'] = JSON.stringify(cookie_check.coupon);


            myPageAction.save_cart_result_price({ 'coupon_price' : cookie_check.coupon_price })
            myPageAction.select_coupon(coupon_obj);
        }
        
        return check_result;
    }

    _saveData = async (order_data) => {
        const { orderAction, myPageAction } = this.props;

        // 가격 설정하기
        const price_obj = {};

        price_obj['result_price'] = order_data.result_price;
        price_obj['discount_price'] = order_data.discount_price;
        price_obj['delivery_price'] = order_data.delivery_price;

        myPageAction.save_cart_result_price(price_obj);

        const save_data = {};
        save_data['order_info'] = JSON.stringify(order_data);

        const cart_list = JSON.parse(order_data.cart_list);
        const get_cart_data = await this._saveCartList(cart_list);
        
        save_data['cart_data'] = JSON.stringify(get_cart_data);
        save_data['loading'] = true;

        return orderAction.save_order_info(save_data)
    }

    _saveCartList = async (list) => {
        const { user_info } = this.props;

        const obj = { 'type' : 'SELECT', 'table' : 'cart', 'comment' : '장바구니 및 상품 정보 조회', 'join' : true, 'join_table' : 'goods' };

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

        let save_cart_data = [];
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
    }

    _toggleModal = (bool) => {
        const { orderAction } = this.props;

        return orderAction.toggle_delivery_code_modal({ 'bool' : bool })
    }

    _handleComplete = (data) => {
        const { orderAction } = this.props;

        let fullAddress = data.address;
        let extraAddress = ''; 
        
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        const result = {
          "order_host_code" : data.zonecode,
          "order_host" : data.address
        }

        orderAction.set_order_host(result);
    
        return this._toggleModal(false);
    
        // console.log(fullAddress);  // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
      }

    _sameDeliveryInfo = () => {
        const { orderAction, user_info, cover_order_name, cover_order_email, cover_order_phone } = this.props;
        const bool = !this.props.order_same_info_bool;

        $('#same_delivery_info_button').prop("checked", bool)

        if(bool === true) {
            $('#same_delivery_info').addClass('bold black');

            $('input[name=order_post_user_name]').val(user_info.name);
            $('input[name=order_post_user_email]').val(user_info.email);
            $('input[name=order_post_user_phone]').val(user_info.phone);

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

    _agreeSaveUserInfo = () => {
        const { orderAction, order_info_agree } = this.props;
        const bool = !order_info_agree;

        if(bool === true) {
            $('#user_info_agree_input').addClass('bold');
            $('#user_info_agree_input').css({ 'color' : '#35c5f0' });

        } else if(bool === false) {
            $('#user_info_agree_input').removeClass('bold');
            $('#user_info_agree_input').css({ 'color' : 'black' });
        }

        return orderAction.toggle_order_info_agree({ 'bool' : bool });
    }

    render() {
        const { 
            order_loading, price_comma, order_delivery_code_modal, user_info, order_host_code, order_host, cart_coupon_price, _removeCoupon,
            cover_order_name, cover_order_email, cover_order_phone, _setModalStyle, coupon_list_open_modal, _toggleCouponListModal
        } = this.props;
        const { _toggleModal, _handleComplete, _sameDeliveryInfo, _saveCoverOrderInfo, _agreeSaveUserInfo } = this;

        const order_info = JSON.parse(this.props.order_info);
        const cart_data = JSON.parse(this.props.cart_data);
        const coupon_select = JSON.parse(this.props.coupon_select);

        return(
            order_loading === true ? 

            <div id='order_div' className='default'>
                <div id='order_cart_div' className='order_div_style'>
                    <h3 className='order_title_div'> 주문 리스트 </h3>

                    <div id='order_cart_list_div'>
                        {/* {JSON.stringify(cart_data)} */}
                        {cart_data.map( (el, key) => {
                            return(
                                <div className='order_list_divs border_bottom_dotted' key={key}>
                                    <div className='order_list_thumbnail_div' 
                                         style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                    />

                                    <div className='order_list_div '> 
                                        <div className='order_list_goods_name font_14 bold paybook_bold'> { el.goods_name } </div>
                                        <div className='order_list_price_and_num_div font_13 gray marginTop_10'> 
                                            {el.num} 개　|　
                                            {price_comma((el.price * el.num))} 원
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

                <form name='order_delivery_form'>

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
                                <input type='input' id='order_delivery_host_code_input' value={order_host_code}  readOnly disabled /> 
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
                                     onClick={() => _toggleModal(false)}
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

                        <div id='order_userInfo_agree_div'>
                            <input type='checkbox' id='agree_userInfo_button' name='agree' className='check_custom_1' onClick={_agreeSaveUserInfo} />
                            <span className='check_toggle_1' onClick={_agreeSaveUserInfo}> </span>
                            <label htmlFor='agree_userInfo_button' className='pointer font_14 paybook_bold' id='user_info_agree_input'> 
                                개인정보 수집에 동의합니다. 
                            </label>
                            <b className='paybook_bold pointer font_14'> [ 약관 보기 ] </b>

                            <p id='order_agree_notice_div'> 동의하지 않을 시, 가상정보가 저장됩니다. </p>
                        </div>
                    </div>
                </div>

                <div id='order_post_user_div' className='order_div_style'>
                    <h3 className='order_title_div'> 주문자 정보 </h3>

                    <div id='order_same_delivery_info_div'>
                        <input type='checkbox' id='same_delivery_info_button' name='agree' className='check_custom_1'
                               onClick={_sameDeliveryInfo}
                        />
                        <span className='check_toggle_1' onClick={_sameDeliveryInfo}> </span>
                        <label htmlFor='same_delivery_info_button' className='pointer gray' id='same_delivery_info'> 
                            배송지와 동일합니다.
                        </label>
                    </div>
                    
                    <div className='order_delivery_top_div'> 
                        <div> * 주문인 </div>
                        <div> 
                            <input type='input' name='order_post_user_name' maxLength='15' className='order_delivery_input_1' defaultValue={cover_order_name} 
                                   onChange={() => _saveCoverOrderInfo('name')}
                            /> 
                        </div>
                    </div>

                    <div className='order_delivery_top_div'> 
                        <div> * 이메일 </div>
                        <div> 
                            <input type='input' name='order_post_user_email' maxLength='30' className='order_delivery_input_1' defaultValue={cover_order_email} 
                                   onChange={() => _saveCoverOrderInfo('email')}
                            /> 
                        </div>
                    </div>

                    <div className='order_delivery_top_div'> 
                        <div> * 전화번호 </div>
                        <div> 
                            <input type='input' name='order_post_user_phone' maxLength='15' className='order_delivery_input_1'  defaultValue={cover_order_phone} 
                                   onChange={() => _saveCoverOrderInfo('phone')}
                            /> 
                        </div>
                    </div>                    
                </div>


                <div id='order_coupon_and_point_div' className='order_div_style'>
                    <h3 className='order_title_div'> 쿠폰 및 포인트 적립 </h3>

                    <div className='order_delivery_top_div'> 
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
                                                     onClick={() => _removeCoupon()}
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
                        <Coupon_list 
                            _toggleCouponListModal={_toggleCouponListModal}
                            _addCoupon={this.props._addCoupon}
                            price_comma={price_comma}
                        />
                    </Modal>
                    
                </div>

                <div id='order_payment_div' className='order_div_style'>
                    <h3 className='order_title_div'> 결제 </h3>
                    
                </div>

                </form>

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
        coupon_select : state.my_page.coupon_select
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      orderAction : bindActionCreators(orderAction, dispatch),
    })
  )(Order);