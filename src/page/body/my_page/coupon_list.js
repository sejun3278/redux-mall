import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import img from '../../../source/img/icon.json';
import coupon_list from '../../../source/coupon_code.json';

class Coupon_list extends Component {

    _selectCoupon = async (data) => {
        // 쿠폰 상태 한번 더 체크하기
        const { myPageAction, cart_origin_price, price_comma } = this.props;
        const cover_coupon_select = JSON.parse(this.props.cover_coupon_select);

        if(coupon_list.coupon_code[data.code]) {

            if(cart_origin_price < data.limit_price) {
                return alert('최소 주문 가격이 ' + price_comma(data.limit_price) + ' 원 이상이여야 합니다.');
            }

            if(cover_coupon_select.id === undefined || cover_coupon_select.id !== data.id) {
                myPageAction.select_coupon({ 'cover' : JSON.stringify(data) });

            } else if(cover_coupon_select.id === data.id) {
                myPageAction.select_coupon({ 'cover' : JSON.stringify({}) });
            }

        } else {
            alert('사용할 수 없는 쿠폰입니다. \n(쿠폰 데이터 없음)');
            return window.location.replace();
        }
    }

    // 쿠폰 적용
    _compalteCoupon = (discount_price, result_price) => {
        const { myPageAction, _toggleCouponListModal, cart_delivery_price, cart_result_price, use_point, price_comma, cart_discount_price } = this.props;
        const cover_coupon_select = JSON.parse(this.props.cover_coupon_select);

        if(!cover_coupon_select.id) {
            return alert('쿠폰을 선택해주세요.')
        }
        const cover_coupon_price = use_point ? use_point : 0;
        const final_price = cart_result_price - cover_coupon_price > 0 ? cart_result_price - cover_coupon_price : 0;

        if(discount_price > final_price) {
            if(!window.confirm('최종 결제가보다 쿠폰 할인가가 더 많습니다.\n쿠폰을 적용하시겠습니까?\n( 할인가 : ' + price_comma(discount_price) + ' 원　|　결제가 : ' + price_comma(final_price) + ' 원 )') ) {
                return;
            }
        }

        const obj = {};
        obj['coupon_price'] = discount_price;
        obj['final_price'] = ((result_price - cart_discount_price) + cart_delivery_price) - cover_coupon_price;

        if(obj['final_price'] < 0) {
            obj['final_price'] = 0;
        }

        console.log(obj['final_price'])
        console.log(result_price, cart_discount_price, cart_delivery_price, cover_coupon_price)
        myPageAction.select_coupon({ 'obj' : JSON.stringify(cover_coupon_select) });
        myPageAction.save_cart_result_price(obj);

        if(cover_coupon_select.id) {
            alert('쿠폰이 적용되었습니다.');
        }

        _toggleCouponListModal(false)
    }

    render() {
        const { 
            _toggleCouponListModal, _addCoupon, price_comma, cart_origin_price, _getCouponList
        } = this.props;

        const coupon_list = JSON.parse(this.props.coupon_list);
        const cover_coupon_select = JSON.parse(this.props.cover_coupon_select);

        const { _selectCoupon, _compalteCoupon } = this;

        let discount_coupon_price = 0;
        let result_price = cart_origin_price;

        if(cover_coupon_select.id !== undefined) {
            if(cover_coupon_select.percent === 1) {
                // 퍼센트 할인인 경우
                const percent = cover_coupon_select.discount / 100;
                let discount_price = Math.trunc(cart_origin_price * percent);

                if(cover_coupon_select.max_discount > 0 && discount_price > cover_coupon_select.max_discount) {
                    discount_price = cover_coupon_select.max_discount;
                }

                discount_coupon_price = discount_price;

            } else {
                // 고정 금액 할인인 경우
                discount_coupon_price = cover_coupon_select.discount;
            }

            result_price = cart_origin_price - discount_coupon_price;
        }

        return(
            <div id='coupon_list_each_div'>
                <img src={img.icon.close_black} id='coupon_list_each_close_button' className='pointer'
                     title='닫기' onClick={() => _toggleCouponListModal(false)}
                />
                <h3 className='kotra_bold_font aCenter border_bottom'> MY 쿠폰함 </h3>

                <form>
                    <div id='coupon_list_each_add_div'>
                        <div> 쿠폰 추가　|　</div>
                        <div> 
                            <input type='input' name='coupon_add_code' id='coupon_list_each_input' />
                            <input type='button' onClick={() => _addCoupon(null, _getCouponList, true, true)} value='등록' id='coupon_list_submit_button' className='button_style_1' />
                        </div>
                    </div>
                </form>

                <div id='coupon_list_each_divs'>
                    <div id='coupon_list_able_length_title' className='font_13 bold'> 보유 쿠폰 : {coupon_list.length} 개 </div>
                    <div id='coupon_list_contents_divs' className='border_black'>
                        {coupon_list.length > 0 ?
                            coupon_list.map( (el) => {

                            let discount_price = '';
                            if(el.percent) {
                                discount_price += el.discount + ' % 할인';

                                if(el.max_discount > 0) {
                                    discount_price += ' (최대 ' + price_comma(el.max_discount) + ' 원 할인)';
                                }

                            } else {
                                discount_price += price_comma(el.discount) + ' 원 할인';
                            }

                            let class_str = 'coupon_list_each_contents_div border pointer marginTop_20 ';
                            if(cover_coupon_select.id === el.id) {
                                class_str += 'select_coupon';
                            }

                            return(
                                <div key={el.id} className={class_str} title={el.name}
                                     onClick={() => _selectCoupon(el)}
                                >
                                    <div className='coupon_list_each_name_div border_right'> 
                                        <h4 className='kotra_bold_font cut_multi_line font_15'> {el.name} </h4>

                                        <div className='coupon_list_each_price_div'>
                                            <div className='gray'> {price_comma(el.limit_price)} 원 이상 구매 시 사용 가능 </div>
                                            <div className='bold'> {discount_price}  </div>
                                        </div>
                                    </div>
                                    <div className='coupon_list_each_date_div font_12'> 
                                        <b> {el.limit_date.slice(0, 10)} 까지 </b>
                                    </div>
                                </div>
                            )
                        })
                    : 
                        <div className='aCenter'>
                            <h4> 사용 가능한 쿠폰이 없습니다. </h4>
                        </div>
                    }

                    </div>
                </div>

                <div id='coupon_list_result_div' className='aCenter bold'>
                    <div>  
                        <div className='coupon_list_each_title_djv'> 상품 원가 </div>
                        <div className='coupon_list_each_content_div'> {price_comma(cart_origin_price)} 원 </div>
                    </div>

                    <div> <h3> - </h3> </div>

                    <div style={{ 'color' : '#35c5f0' }}>
                        <div className='coupon_list_each_title_djv'> 쿠폰 할인가 </div>
                        <div className='coupon_list_each_content_div'> {price_comma(discount_coupon_price)} 원 </div>
                    </div>

                    <div> <h2> = </h2> </div>
                    <div>  
                        <div className='coupon_list_each_title_djv'> 최종 결제가 </div>
                        <div className='coupon_list_each_content_div'> {price_comma(result_price)} 원 </div>
                    </div>
                </div>

                <div id='coupon_submit_button_div' className='aCenter button_style_1 pointer'
                     onClick={() => _compalteCoupon(discount_coupon_price, result_price)}
                >
                    적용하기
                </div>
            </div>
        )
    }
}

Coupon_list.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        user_info : state.config.user_info,
        disable_type : state.my_page.disable_type,
        confirm_number : state.config.confirm_number,
        coupon_list : state.my_page.coupon_list,
        cart_result_price : state.my_page.cart_result_price,
        coupon_discount_price : state.my_page.coupon_discount_price,
        cover_coupon_select : state.my_page.cover_coupon_select,
        cart_delivery_price : state.my_page.cart_delivery_price,
        use_point : state.my_page.use_point,
        cart_origin_price : state.my_page.cart_origin_price,
        cart_discount_price : state.my_page.cart_discount_price
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Coupon_list);