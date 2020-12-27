import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import Coupon_list from '../my_page/coupon_list';
import '../../../css/myPage.css';

import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';
  
Modal.setAppElement('body')

class Cart extends Component {

    componentDidMount() {
        // 장바구니 정보 가져오기
        this._getMyCartData();   
    }
    
    _setSelectCartList = (data, num_obj) => {
        const { myPageAction } = this.props;

        let select_arr = [];
        data.forEach( (el) => {
            if(el.goods_stock > 0 && el.goods_state === 1) {
                select_arr.push(el.id);
            }
        })

        this._setFinalResultPrice(data, select_arr, num_obj);

        return myPageAction.save_cart_data({ 'select_arr' : JSON.stringify(select_arr), 'length' : select_arr.length });
    }

    // 장바구니 정보 가져오기
    _getMyCartData = async () => {
        const { user_info, myPageAction } = this.props;
    
        const obj = { 'type' : "SELECT", 'table' : "cart", 'comment' : "내 장바구니 정보 가져오기", 'join' : true, 'join_table' : 'goods' };

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
        obj['option']['state'] = '=';
        obj['option']['remove_state'] = '=';

        obj['where'] = [];
        obj['where'][0] = { 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id };
        obj['where'][1] = { 'table' : 'cart', 'key' : 'state', 'value' : 1 };
        obj['where'][2] = { 'table' : 'cart', 'key' : 'remove_state', 'value' : 0 };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
        const result_data = get_data.data[0];
        
        const num_obj = {};
        result_data.forEach( (el) => {
            let cover_num = el.num;
            if(el.num > el.goods_stock) {
                cover_num = el.goods_stock;

                this._modfiyCartNumber(el)             
            }

            num_obj[el.id] = cover_num;
        })

        const save_obj = {};
        save_obj['arr'] = JSON.stringify(result_data);
        save_obj['bool'] = true;
        save_obj['num_obj'] = JSON.stringify(num_obj);

        this._setSelectCartList(result_data, num_obj);

        return myPageAction.save_cart_data(save_obj)
    }

    // 장바구니 갯수 자동 조정
    _modfiyCartNumber = async (data) => {
        const { user_info } = this.props;

        const obj = { 'type' : "UPDATE", 'table' : "cart", 'comment' : "장바구니 수량 자동 조정" };
        obj['where_limit'] = 1;

        obj['columns'] = [];
        obj['columns'][0] = { 'key' : 'modify_date', 'value' : null };
        obj['columns'][1] = { 'key' : 'num', 'value' : data.goods_stock };

        obj['where'] = [];
        
        obj['where'][0] = { 'key' : 'id', 'value' : data.id };
        obj['where'][1] = { 'key' : 'user_id', 'value' : user_info.id };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
    }

    // 갯수 조정
    _modifyGoodsNumber = async (bool, data) => {
        const { myPageAction } = this.props;
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);

        const stock_limit = data.goods_stock;

        let cover_num = Number(cart_num_obj[data.id]);
        if(bool === 'plus') {
            cover_num = cover_num + 1;

        } else if(bool === 'minus') {
            if(cover_num > 1) {
                cover_num = cover_num - 1;
            }
        } else if(bool === 'change') {
            cover_num = Number($('input[name=cart_num_input_' + data.id + ']').val())
        }

        if(cover_num < 1) {
            // 최소 1 이상이여야 한다.
            cover_num = 1;

        } else if(cover_num > stock_limit) {
            // 구매 가능 갯수를 넘어갈 수 없음
            cover_num = stock_limit;
        }

        cart_num_obj[data.id] = cover_num;

        const cart_data = JSON.parse(this.props.cart_data);
        const select_list = JSON.parse(this.props.cart_select_list);
        this._setFinalResultPrice(cart_data, select_list, cart_num_obj);

        myPageAction.change_cart_goods_number({ 'num_obj' : JSON.stringify(cart_num_obj) });
    }

    // 최종 결제금액 구하기
    _setFinalResultPrice = (data, select_list, num_obj) => {
        const { myPageAction } = this.props;

        const cart_data = data === null ? JSON.parse(this.props.cart_data) : data;
        const cart_select_list = select_list === null ? JSON.parse(this.props.cart_select_list) : select_list;
        const cart_num_obj = num_obj === null ? JSON.parse(this.props.cart_num_obj) : num_obj;

        const obj = {};
        obj['origin_price'] = 0;
        obj['discount_price'] = 0;
        obj['result_price'] = 0;

        cart_data.forEach( (el) => {
            if(cart_select_list.includes(el.id)) {
                obj['origin_price'] += (el.goods_origin_price * cart_num_obj[el.id]);

                if(el.goods_discount_price > 0) {
                    obj['discount_price'] += Math.ceil( el.goods_origin_price * ((el.goods_discount_price / 100) * cart_num_obj[el.id]) );
                
                } else {
                    obj['discount_price'] += 0;
                }

                obj['result_price'] += (el.goods_result_price * cart_num_obj[el.id])
            }
        })

        obj['final_price'] = obj['result_price']
        if(obj['result_price'] < 30000) {
            // 3만원 미만일 때 배송비 추가
            obj['delivery_price'] = 2500;
            obj['final_price'] += 2500;
        } else {
            obj['delivery_price'] = 0;
            
        }

        myPageAction.save_cart_result_price(obj);
    }

    // 선택 버튼 클릭시
    _setEachSelect = (data, id, obj) => {
        let cart_select_list = JSON.parse(this.props.cart_select_list);
        const cart_data = JSON.parse(this.props.cart_data);
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);

        const { myPageAction, cart_able_goods_length } = this.props;

        if(data.goods_stock === 0) {
            // 품절 상태인 경우
            $('#cart_each_select_button_' + id).prop("checked", false);
            return alert('품절 상태인 상품입니다.');

        } else if(data.goods_state === 0) {
            $('#cart_each_select_button_' + id).prop("checked", false);
            return alert('판매 중단된 상품입니다.');
        }

        if(cart_select_list.includes(id)) {
            // ON => OFF : 선택 해제
            cart_select_list = cart_select_list.filter(el => el !== id);
            $('#cart_all_select').prop("checked", false);

        } else {
            // OFF => ON : 선택
            cart_select_list.push(id);

            if(cart_select_list.length === cart_able_goods_length) {
                $('#cart_all_select').prop("checked", true);
            }
        }

        this._setFinalResultPrice(cart_data, cart_select_list, cart_num_obj)
        return myPageAction.save_cart_data({ 'select_arr' : JSON.stringify(cart_select_list) });
    }

    _allSelect = (cart_data, cart_select_list, cart_num_obj) => {
        const { myPageAction } = this.props;
        const select_check = $('#cart_all_select').is(":checked");

        $('.cart_select_button').prop("checked", select_check);

        if(select_check === true) {
            return this._setSelectCartList(cart_data, cart_num_obj);
            
        } else {
            // 전체 해제
            cart_select_list = [];        
        }

        this._setFinalResultPrice(cart_data, cart_select_list, cart_num_obj)
        return myPageAction.save_cart_data({ 'select_arr' : JSON.stringify(cart_select_list) });
    }

    // 삭제
    _removeEachCartList = async (id, qna) => {
        const { user_info } = this.props;

        if(qna) {
            if(!window.confirm('해당 물품을 장바구니에서 삭제하시겠습니까?')) {
                return;
            }
        }

        const obj = { 'type' : "UPDATE", 'table' : "cart", 'comment' : "장바구니 상품 비활성화" };
        obj['where_limit'] = 1;

        obj['columns'] = [];
        obj['columns'][0] = { 'key' : 'modify_date', 'value' : null };
        obj['columns'][1] = { 'key' : 'remove_state', 'value' : 1 };

        obj['where'] = [];
        
        obj['where'][0] = { 'key' : 'id', 'value' : id };
        obj['where'][1] = { 'key' : 'user_id', 'value' : user_info.id };


        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        alert('해당 상품이 장바구니에서 삭제되었습니다.');

        return this._getMyCartData();
    }

    // 알림 닫기
    _closeAlert = async (type, id) => {

        if(type === 'remove') {
            return this._removeEachCartList(id)

        } else if(type === 'close') {
            return $('#cart_disable_divs_' + id).remove();

        }
    }

    _saveChangeCartNumber = async (data) => {
        const { user_info } = this.props;
        let cart_num = $('input[name=cart_num_input_' + data.id + ']').val();

        if(cart_num < 1) {
            cart_num = 1;

        } else if(cart_num > data.goods_stock) {
            cart_num = data.goods_stock;
        }

        const obj = { 'type' : "UPDATE", 'table' : "cart", 'comment' : "장바구니 갯수 변경" };
        obj['where_limit'] = 1;

        obj['columns'] = [];
        obj['columns'][0] = { 'key' : 'modify_date', 'value' : null };
        obj['columns'][1] = { 'key' : 'num', 'value' : cart_num };

        obj['where'] = [];
        
        obj['where'][0] = { 'key' : 'id', 'value' : data.id };
        obj['where'][1] = { 'key' : 'user_id', 'value' : user_info.id };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
    }

    // 구매하기 버튼 클릭
    _moveOrder = async () => {
        const { user_info, _getCookie, cart_result_price, cart_delivery_price, cart_discount_price, cart_coupon_price } = this.props;
        const cart_select_list = JSON.parse(this.props.cart_select_list);
        const cart_data = JSON.parse(this.props.cart_data);
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);
        const coupon_select = JSON.parse(this.props.coupon_select);

        const user_cookie = await this.props._getCookie('login', 'get');

        let num_check = true;
        let fall_reason = '';

        if(user_info === undefined || user_cookie.id !== user_info.id) {
            alert('로그아웃 된 아이디 입니다.');
            return window.location.replace('/');

        } else if(cart_select_list.length === 0) {
            return alert('구매할 상품을 1 개 이상 선택해주세요.');
        }

        cart_data.forEach( (el) => {
            if(cart_num_obj[el.id] > el.goods_stock) {
                num_check = false;
                fall_reason = ' [ ' +  el.goods_name + ' ] \n' + '상품의 구매 갯수를 조정해주세요.';

                return;
            }
        })

        if(num_check === false) {
            return alert(fall_reason);
        }

        // 주문 여부 확인하기
        if(!window.confirm('해당 상품들을 주문하시겠습니까?')) {
            return;
        }

        const save_cookie = {};
        save_cookie['user_id'] = user_info.id;
        save_cookie['select_list'] = cart_num_obj;
        save_cookie['coupon'] = coupon_select;
        save_cookie['coupon_price'] = cart_coupon_price;

        // 인증 코드 추가
        let code = '';
        for(let i = 0; i < Math.trunc(Math.random() * (10 - 6) + 6); i++) {
            let number = Math.trunc(Math.random() * (10 - 0) + 0);
            code += String(number);
        }
        save_cookie['code'] = code;

        await _getCookie('order', 'add', JSON.stringify(save_cookie), { 'time' : 60 } );

        const obj = { "type" : "INSERT", "table" : "order", "comment" : "임시 주문 내역 추가하기" };

        obj['columns'] = [];

        let order_title = '';
        order_title = cart_data[0].goods_name;
        
        if(cart_select_list.length > 1) {
            order_title += ' 외 ' + (cart_select_list.length - 1) + ' 개';
        }


        obj['columns'][0] = { "key" : "user_id", "value" : user_info.id };
        obj['columns'][1] = { "key" : "order_state", "value" : 0 };
        obj['columns'][2] = { "key" : "cart_list", "value" : JSON.stringify(cart_select_list) };
        obj['columns'][3] = { "key" : "code", "value" : code };
        obj['columns'][4] = { "key" : "create_date", "value" : null };
        obj['columns'][5] = { "key" : "order_title", "value" : order_title };
        obj['columns'][6] = { "key" : "result_price", "value" : cart_result_price };
        obj['columns'][7] = { "key" : "discount_price", "value" : cart_discount_price };
        obj['columns'][8] = { "key" : "delivery_price", "value" : cart_delivery_price };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        return window.location.href='/myPage/order';
    }

    render() {
        const { 
            cart_loading, price_comma, cart_origin_price, cart_discount_price, cart_result_price, cart_able_goods_length, cart_delivery_price, _toggleCouponListModal,
            coupon_list_open_modal, cart_final_price, cart_coupon_price, _removeCoupon, _setModalStyle
        } = this.props;

        const cart_data = JSON.parse(this.props.cart_data);
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);
        const cart_select_list = JSON.parse(this.props.cart_select_list);
        const coupon_select = JSON.parse(this.props.coupon_select);

        const { _modifyGoodsNumber, _allSelect, _setEachSelect, _removeEachCartList, _closeAlert, _saveChangeCartNumber, _moveOrder } = this;

        let all_select_check = false;
        if(cart_loading) {
            all_select_check = cart_select_list.length === cart_able_goods_length;
        }

        return(
            <div id='cart_div'>
                {cart_loading === true 
                
                ? <div id='cart_list_div'>
                    {cart_data.length > 0 ?
                    <div>
                    <h4 className='recipe_korea cart_goods_list_title'> - 내 장바구니 리스트 </h4>

                    <div id='cart_contents_div'>
                        <div id='cart_select_div'>
                            <input type='checkbox' id='cart_all_select' className='pointer' defaultChecked={all_select_check} onChange={() => _allSelect(cart_data, cart_select_list, cart_num_obj)} />
                            <label htmlFor='cart_all_select' className='pointer bold font_14'> 전체 선택 <b className='gray'>　( {cart_select_list.length} / {cart_able_goods_length} ) </b> </label>
                        </div>

                        {cart_data.map( (el, key) => {
                            const check_obj = { };

                            check_obj['stock_check'] = el.goods_stock === 0 ? false : true;
                            check_obj['able_check'] = el.goods_state === 0 ? false : true;

                            check_obj['price_check'] = true;
                            if(el.price !== el.goods_result_price) {
                                check_obj['price_check'] = false;
                            }
                            
                            const open_bool = check_obj['stock_check'] === false || check_obj['able_check'] === false || check_obj['price_check'] === false;

                            let disable_title = '구매 불가';
                            let disable_reason = "품절된 상품입니다.";
                            let disable_button = '삭제';

                            let close_type = "remove";

                            if(check_obj['able_check'] === false) {
                                disable_reason = "판매 중단된 상품입니다.";

                            } else if(check_obj['price_check'] === false) {
                                disable_title = '가격 변동';
                                disable_reason = `기존 : ${price_comma(el.price)} 원　→　변동 : ${price_comma(el.goods_result_price)} 원`;
                                disable_button = '확인';

                                close_type = 'close'
                            }

                            return(
                                <div className='cart_contents_divs border_bottom border_top' key={key}>
                                    {open_bool
                                    ? <div className='cart_disable_divs aCenter recipe_korea default' id={'cart_disable_divs_' + el.id}>
                                        <h2 className='cart_disable_title_div red marginTop_20'> {disable_title} </h2>
                                        <h3 className='cart_disable_reason_div white marginTop_30'> { disable_reason } </h3>

                                        <div>
                                            <input type='button' value={disable_button} className='bold pointer cart_disable_remove_button'
                                                onClick={() => _closeAlert(close_type, el.id, el)}
                                                // onClick={() => check_obj['price_check'] === false ? $('#cart_disable_divs_' + el.id).remove() : _removeEachCartList(el.id)}
                                            />      
                                        </div>
                                      </div>
                                
                                    : null}

                                    <div className='cart_info_div font_13 border_bottom padding_5 pointer' >
                                        <div className='cart_select_divs'>
                                            <input type='checkbox' className='cart_select_button pointer' id={'cart_each_select_button_' + el.id} 
                                                defaultChecked={cart_select_list.includes(el.id) ? true : false}
                                                onChange={() => _setEachSelect(el, el.id)}
                                            />
                                            <label htmlFor={'cart_each_select_button_' + el.id} className='pointer'> 선택 </label>
                                        </div>

                                        <div className='cart_remove_divs'>
                                            <input type='button' value='삭제' className='pointer' onClick={() => _removeEachCartList(el.id, true)} />
                                        </div>
                                    </div>

                                    <div className='cart_grid_divs'>
                                        <div className='cart_thumbnail_div border_right'>
                                            <div style={{ 'backgroundImage' : `url(${el.thumbnail})` }} 
                                                 className='pointer'
                                                 onClick={() => window.location.href = '/goods?goods_num=' + el.goods_id}
                                                 title='상품으로 이동'
                                            />
                                        </div>

                                        <div className='cart_name_and_num_div'>
                                            <div className='cart_name_and_price_div'>
                                                <div className='cart_name_div t_money_font'> 
                                                    <b className='pointer' onClick={() => window.location.href = '/goods?goods_num=' + el.goods_id}
                                                    title='상품으로 이동'
                                                    > 
                                                        {el.goods_name} 
                                                    </b> 
                                                </div>

                                                <div className='cart_discount_price_div font_13 gray'>
                                                    <del> {price_comma(el.goods_origin_price)} 원 </del>
                                                    <b>　( {el.goods_discount_price} % ) </b> 
                                                </div>
                                                <div className='cart_price_div'> 
                                                    <b> {price_comma(el.goods_result_price)} 원 </b> 
                                                    
                                                </div>
                                            </div>
                                            
                                            <div className='cart_num_result_div'>
                                                <div className='cart_num_div bold aRight'>
                                                    <div className='font_13'> 
                                                        <b> 수량　|　</b>
                                                        <input type='number' min={1} max={1000000000} 
                                                               value={cart_num_obj[el.id]} name={'cart_num_input_' + el.id} 
                                                               onChange={() => _modifyGoodsNumber('change', el)}
                                                               onBlur={() => _saveChangeCartNumber(el)}
                                                        />
                                                        <b> 개 </b>
                                                    </div>
                                                </div>

                                                <div className='cart_able_num_div font_12 gray aRight'>
                                                    <p> 구매 가능 갯수　|　{price_comma(el.goods_stock)} 개 </p>
                                                </div>

                                                <div className='cart_result_price_div'>
                                                    <div className='aRight'> <h3> {price_comma(el.goods_result_price * cart_num_obj[el.id])} 원 </h3> </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div id='cart_select_list_remove_button_div'>
                            <input className='bold pointer font_15 gray' type='butotn' defaultValue='선택 항목 삭제'/>
                        </div>

                        </div>

                        {/* <div id='cart_middle_layout'/> */}

                        <div className='cart_div_lists'>
                            <h4 className='recipe_korea cart_goods_list_title'> - 쿠폰 및 포인트 적립 </h4>

                            <div id='cart_coupon_div' className='cart_grid_div'>
                                <div className='bold'> 쿠폰 적용 </div>
                                <div> 
                                    <input id='cart_add_coupon_button' className='button_style_1' type='button' value='쿠폰 추가'
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
                                            <div>   <img src={icon.icon.close_black} id='cart_remove_coupon' className='pointer' title='쿠폰 해제'
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

                        <div id='cart_all_result_price_div' className='cart_div_lists'>
                            <h4 className='recipe_korea cart_goods_list_title'> - 계산서 </h4>

                            <div id='cart_price_show_div'>
                                <div className='cart_price_show_grid_div'> 
                                    <div> <h4> 상품 원가 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> { price_comma(cart_origin_price) } 원 </h4> </div>
                                </div>

                                <div className='cart_price_show_grid_div border_top_dotted' style={{ 'backgroundColor' : '#bbbbbb', 'color' : 'white' }}> 
                                    <div> <h4> 상품 할인 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> - { price_comma(cart_discount_price) } 원 </h4> </div>
                                </div>

                                    {cart_delivery_price > 0 || cart_coupon_price > 0
                                    ?
                                    <div>
                                        <div className='cart_price_show_grid_div border_top_dotted'> 
                                            <div> <h4> 예상 결제가 </h4> </div>
                                            <div className='aRight cart_price_result_div'> <h4> { price_comma(cart_result_price) } 원 </h4> </div>
                                        </div>
                                        
                                        {cart_delivery_price > 0 ?
                                        <div className='border_top_dotted border_bottom_dotted border_width_2'>
                                            <div className='cart_price_show_grid_div' id='cart_delivery_price_div'>
                                                <div> <h4> └　배송비 </h4> <img className='cart_price_div_icon' src={icon.my_page.delivery_black} /> </div>
                                                <div className='aRight cart_price_result_div'> <h4> + { price_comma(cart_delivery_price) } 원 </h4> </div>
                                                <p id='cart_delivery_alert_div' className='gray font_12'> 3 만원 미만 구매시, 배송비 2,500 원 추가 </p>
                                            </div>
                                        </div>
                                        : null}

                                        {cart_coupon_price > 0 ?
                                        <div className='border_top_dotted border_bottom_dotted border_width_2'>
                                            <div className='cart_price_show_grid_div' id='cart_coupon_price_div'>
                                                <div> <h4> └　쿠폰 할인 </h4> <img className='cart_price_div_icon' id='cart_coupon_icon' src={icon.my_page.coupon_black} /> </div>
                                                <div className='aRight cart_price_result_div'> <h4> - { price_comma(cart_coupon_price) } 원 </h4> </div>
                                            </div>
                                        </div>

                                        : null}
                                    </div>

                                    : null}

                                <div className='cart_price_show_grid_div border_top_black border_width_2' id='final_result_price'> 
                                    <div> <h4> 최종 결제가 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> { price_comma(cart_final_price) } 원 </h4> </div>
                                </div>

                            </div>
                        </div>

                            <div id='cart_order_select_div'>
                                <div />
                                <h4 className='recipe_korea cart_goods_list_title aCenter pointer'
                                    onClick={_moveOrder}
                                > 
                                    구매하기 
                                </h4>
                                {/* <div /> */}
                            </div>
                        </div>

                        : <div className='aCenter' id='empty_cart_div'>
                            <h3 className='t_money_font'> 장바구니가 비어있습니다. </h3>    

                            <div id='empty_select_div'> 
                                <u className='pointer remove_underLine'
                                   onClick={() => window.location.href='/search'}> 
                                    ◁　상품 보러 가기 
                                </u>
                            </div>
                          </div>
                        }
                    </div>
                : null}
            </div>
        )
    }
}

Cart.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        cart_data : state.my_page.cart_data,
        cart_loading : state.my_page.cart_loading,
        cart_num_obj : state.my_page.cart_num_obj,
        cart_select_list : state.my_page.cart_select_list,
        cart_origin_price : state.my_page.cart_origin_price,
        cart_discount_price : state.my_page.cart_discount_price,
        cart_result_price : state.my_page.cart_result_price,
        cart_final_price : state.my_page.cart_final_price,
        cart_able_goods_length : state.my_page.cart_able_goods_length,
        cart_delivery_price : state.my_page.cart_delivery_price,
        cart_coupon_price : state.my_page.cart_coupon_price,
        coupon_select : state.my_page.coupon_select
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Cart);