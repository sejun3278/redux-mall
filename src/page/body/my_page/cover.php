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