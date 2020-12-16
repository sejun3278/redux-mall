import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/myPage.css';

import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

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

        return myPageAction.save_cart_data({ 'select_arr' : JSON.stringify(select_arr) });
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

        obj['where'] = [];
        obj['where'][0] = { 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id };
        obj['where'][1] = { 'table' : 'cart', 'key' : 'state', 'value' : 1 };


        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })
        const result_data = get_data.data[0];
        
        const num_obj = {};
        result_data.forEach( (el) => {
            num_obj[el.id] = el.num;
        })

        const save_obj = {};
        save_obj['arr'] = JSON.stringify(result_data);
        save_obj['bool'] = true;
        save_obj['num_obj'] = JSON.stringify(num_obj);

        this._setSelectCartList(result_data, num_obj);


        return myPageAction.save_cart_data(save_obj)
    }

    // 갯수 조정
    _modifyGoodsNumber = (bool, obj) => {
        const { myPageAction } = this.props;
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);

        const stock_limit = obj.goods_stock;

        let cover_num = Number(cart_num_obj[obj.id]);
        if(bool === 'plus') {
            cover_num = cover_num + 1;

        } else if(bool === 'minus') {
            if(cover_num > 1) {
                cover_num = cover_num - 1;
            }
        } else if(bool === 'change') {
            cover_num = Number($('input[name=cart_num_input_' + obj.id + ']').val())
        }

        if(cover_num < 1) {
            // 최소 1 이상이여야 한다.
            cover_num = 1;

        } else if(cover_num > stock_limit) {
            // 구매 가능 갯수를 넘어갈 수 없음
            cover_num = stock_limit;
        }

        cart_num_obj[obj.id] = cover_num;

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

        myPageAction.save_cart_result_price(obj);
    }

    render() {
        const { cart_loading, price_comma, cart_origin_price, cart_discount_price, cart_result_price } = this.props;
        const cart_data = JSON.parse(this.props.cart_data);
        const cart_num_obj = JSON.parse(this.props.cart_num_obj);
        const cart_select_list = JSON.parse(this.props.cart_select_list);

        const { _modifyGoodsNumber } = this;

        console.log(cart_origin_price, cart_discount_price, cart_result_price)
        return(
            <div id='cart_div'>
                {cart_loading === true 
                
                ? <div>
                    <h4 className='recipe_korea cart_goods_list_title'> - 내 장바구니 리스트 </h4>

                    <div id='cart_contents_div'>
                        {cart_data.map( (el, key) => {
                            return(
                                <div className='cart_contents_divs border_bottom border_top' key={key}>

                                    <div className='cart_info_div font_13 border_bottom padding_5 pointer'>
                                        <input type='checkbox' className='cart_select_button pointer' id={'cart_each_select_button_' + key} 
                                               defaultChecked={cart_select_list.includes(el.id) ? true : false}
                                        />
                                        <label htmlFor={'cart_each_select_button_' + key} className='pointer'> 선택 </label>
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
                                                <div className='cart_num_div bold aCenter'>
                                                    <div className='cart_num_button_div'
                                                         onClick={() => _modifyGoodsNumber('minus', el)}> 
                                                        － 
                                                    </div>

                                                    <div> 
                                                        <input type='number' min={1} max={1000000000} 
                                                               value={cart_num_obj[el.id]} name={'cart_num_input_' + el.id} 
                                                               onChange={() => _modifyGoodsNumber('change', el)}
                                                        /> 
                                                    </div>

                                                    <div className='cart_num_button_div'
                                                         onClick={() => _modifyGoodsNumber('plus', el)}
                                                    > 
                                                        ＋ 
                                                    </div>
                                                </div>

                                                <div className='cart_able_num_div font_12 gray aLeft'>
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
                        </div>

                        <div className='cart_all_result_price_div border_top_black border_width_2'>
                            <h4 className='recipe_korea cart_goods_list_title'> - 계산서 </h4>

                            <div id='cart_price_show_div'>
                                <div className='cart_price_show_grid_div'> 
                                    <div> <h4> 상품 원가 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> { price_comma(cart_origin_price) } 원 </h4> </div>
                                </div>

                                <div className='cart_price_show_grid_div border_bottom_black border_width_2'> 
                                    <div> <h4> 상품 할인 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> - { price_comma(cart_discount_price) } 원 </h4> </div>
                                </div>

                                <div className='cart_price_show_grid_div' id='final_result_price'> 
                                    <div> <h4> 최종 결제가 </h4> </div>
                                    <div className='aRight cart_price_result_div'> <h4> { price_comma(cart_result_price) } 원 </h4> </div>
                                </div>

                            </div>
                        </div>
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
        cart_result_price : state.my_page.cart_result_price
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Cart);