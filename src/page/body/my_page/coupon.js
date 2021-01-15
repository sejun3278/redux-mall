import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

class Coupon extends Component {

    render() {
        const { coupon_loading, price_comma, _addCoupon, _getCouponList } = this.props;
        const coupon_list = JSON.parse(this.props.coupon_list);

        return(
            coupon_loading === true ?

            <div id='coupon_div' className='order_div_style default'>
                <h3 className='order_title_div'> 쿠폰 리스트 </h3>

                <div id='coupon_other_div'>
                    <div className='font_14'> <b> 보유 쿠폰 : {coupon_list.length} 개 </b> </div>
                    <div id='coupon_add_input_div' className='font_13'>
                        {/* <form name='add_coupon_form'> */}
                            <b className='gray'> 쿠폰 코드 입력　|　 </b>
                            <input type='input' name='coupon_add_code' maxLength='20' />
                            <input type='button' id='coupon_add_button' value='쿠폰 추가' className='button_style_1' 
                                   onClick={() => _addCoupon(null, _getCouponList, true, true)}
                            />
                        {/* </form> */}
                    </div>
                </div>

                <div id='coupon_list_div'>
                    {coupon_list.length > 0
                    
                        ? <div>
                            <div id='coupon_list_other_div' className='coupon_div_style border t_money_font'>
                                {/* <div> 번호 </div> */}
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
                                            {/* <div className='border_right'> {el.id} </div> */}
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