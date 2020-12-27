import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import img from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

import coupon_list from '../../../source/coupon_code.json';

let coupon_adding = false;
class Coupon extends Component {

    // componentDidMount() {
    //     this._getCouponList();
    // }

    // // 쿠폰 조회하기
    // _getCouponList = async () => {
    //     const { myPageAction, user_info } = this.props;

    //     const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 조회하기' };

    //     obj['option'] = {};

    //     obj['option']['user_id'] = '=';
    //     obj['option']['state'] = '=';
    //     obj['option']['limit_date'] = '>=';

    //     obj['where'] = [];
    //     obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.id };
    //     obj['where'][1] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };
    //     obj['where'][2] = { 'table' : 'coupon', 'key' : 'limit_date', 'value' : null };

    //     const get_data = await axios(URL + '/api/query', {
    //         method : 'POST',
    //         headers: new Headers(),
    //         data : obj
    //     })

    //     myPageAction.save_coupon_data({ 'list' : JSON.stringify(get_data.data[0]) })
    // }
    
    // 쿠폰 추가
    // _addCoupon = async (event) => {
    //     event.preventDefault();
    //     const code = event.target.coupon_add_code.value;

    //     if(coupon_adding === true) {
    //         return;
    //     }

    //     if(code === "" || code.length === 0) {
    //         $('input[name=coupon_add_code]').focus();
    //         return alert('추가할 쿠폰 코드 번호를 입력해주세요.');

    //     } else {
    //         const { user_info, _getCookie, admin_info } = this.props;
    //         const user_cookie = await _getCookie("login", "get");

    //         if(!user_info.id && !user_cookie) {
    //             alert('로그아웃 된 아이디 입니다.');
    //             return window.location.replace('/')
    //         }

    //         if(coupon_list.coupon_code[code] === undefined) {
    //             return alert('해당 코드의 쿠폰을 찾을 수 없습니다.');

    //         } else {
    //             const coupon = coupon_list.coupon_code[code];
    //             if(coupon.able === false) {
    //                 return alert('사용할 수 없는 쿠폰입니다.');
                
    //             } else {
    //                 if(coupon.admin === true) {
    //                     if(admin_info !== true) {
    //                         return alert('권한이 없습니다.');
    //                     }
    //                 }
    //             }

    //             coupon_adding = true;

    //             // 쿠폰 중복 체크
    //             const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 중복 체크' };

    //             obj['option'] = {};

    //             obj['option']['user_id'] = '=';
    //             obj['option']['code'] = '=';
    //             obj['option']['state'] = '=';

    //             obj['where'] = [];
    //             obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.id };
    //             obj['where'][1] = { 'table' : 'coupon', 'key' : 'code', 'value' : code };
    //             obj['where'][2] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };

    //             const query_result = await axios(URL + '/api/query', {
    //                 method : 'POST',
    //                 headers: new Headers(),
    //                 data : obj
    //             })

    //             if(query_result.data[0][0]) {
    //                 // myPageAction.toggle_add_coupon({ 'bool' : false });
    //                 coupon_adding = false;

    //                 return alert('이미 추가된 쿠폰입니다.');
    //             }
                
    //             // 쿠폰 추가
    //             obj['type'] = 'INSERT';
    //             obj['comment'] = '쿠폰 추가';

    //             obj['columns'] = [];

    //             const percent = coupon.percent === true ? 1 : 0;

    //             obj['columns'].push({ "key" : "user_id", "value" : user_info.id })
    //             obj['columns'].push({ "key" : "code", "value" : code })
    //             obj['columns'].push({ "key" : "discount", "value" : coupon.discount })
    //             obj['columns'].push({ "key" : "limit_price", "value" : coupon.limit_price })
    //             obj['columns'].push({ "key" : "state", "value" : 0 })
    //             obj['columns'].push({ "key" : "create_date", "value" : null })
    //             obj['columns'].push({ "key" : "limit_date", "value" : coupon.limit_date })
    //             obj['columns'].push({ "key" : "name", "value" : coupon.name })
    //             obj['columns'].push({ "key" : "max_discount", "value" : coupon.max_discount })
    //             obj['columns'].push({ "key" : "percent", "value" : percent })

    //             await axios(URL + '/api/query', {
    //                 method : 'POST',
    //                 headers: new Headers(),
    //                 data : obj
    //             })

    //             coupon_adding = false;

    //             $('input[name=coupon_add_code]').val("");
    //             this._getCouponList();
    //             return alert('쿠폰이 등록되었습니다.');
    //         }
    //     }
    // }

    render() {
        const { coupon_loading, price_comma } = this.props;
        const { _addCoupon } = this;
        const coupon_list = JSON.parse(this.props.coupon_list);

        return(
            coupon_loading === true ?

            <div id='coupon_div' className='order_div_style default'>
                <h3 className='order_title_div'> 쿠폰 리스트 </h3>

                <div id='coupon_other_div'>
                    <div className='font_14'> <b> 보유 쿠폰 : {coupon_list.length} 개 </b> </div>
                    <div id='coupon_add_input_div' className='font_13'>
                        <form name='add_coupon_form' onSubmit={_addCoupon}>
                            <b className='gray'> 쿠폰 코드 입력　|　 </b>
                            <input type='input' name='coupon_add_code' maxLength='20' />
                            <input type='submit' id='coupon_add_button' value='쿠폰 추가' className='button_style_1' />
                        </form>
                    </div>
                </div>

                <div id='coupon_list_div'>
                    {coupon_list.length > 0
                    
                        ? <div>
                            <div id='coupon_list_other_div' className='coupon_div_style border t_money_font'>
                                <div> 번호 </div>
                                <div id='coupon_name_other_div'> 이름 </div>
                                <div className='border_none_right' id='coupon_date_other_div'> 기간 </div>
                            </div>

                            {coupon_list.map( (el, key) => {
                                let discount_price = '';
                                if(el.percent) {
                                    discount_price += el.discount + ' % 할인';
                                    discount_price += ' (최대 ' + price_comma(el.max_discount) + ' 원 할인)';

                                } else {
                                    discount_price += price_comma(el.discount) + ' 원 할인';
                                }

                                return(
                                    <div key={key}>
                                        <div className='coupon_div_style coupon_list_divs border'>
                                            <div className='border_right'> {el.id} </div>
                                            <div className='coupon_name_div' title={el.name}> 
                                                <h4 className='kotra_bold_font cut_multi_line'> {el.name} </h4>

                                                <div className='coupon_price_divs'>
                                                    <div className='gray'> {price_comma(el.limit_price)} 원 이상 구매 시 사용 가능 </div>
                                                    <div className='bold'> {discount_price}  </div>
                                                </div>
                                            </div>
                                            <div className='coupon_limit_date_div  border_none_right'> 
                                                <b> {el.limit_date.slice(0, 10)} 까지 </b>
                                            </div>
                                        </div>

                                        <div className='coupon_responsive_date_div display_none bold'>
                                            <div className='coupon_responsive_grid_div'>
                                                <div className='border_right'> 기간 </div>
                                                <div className='coupon_responsive_date_divs'> {el.limit_date.slice(0, 10)} 까지 </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                          </div>

                        : <div id='coupon_empty_div'>
                            <h2 className='paybook_bold'> 보유중인 쿠폰이 없습니다. </h2>
                          </div>
                    }
                </div>
            </div>

            : null
        )
    }
}

Coupon.defaultProps = {
    // coupon_loading : false
  }
  
  export default connect(
    (state) => ({
        coupon_loading : state.my_page.coupon_loading,
        coupon_list : state.my_page.coupon_list
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Coupon);