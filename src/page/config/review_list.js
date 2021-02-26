import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as goodsAction from '../../Store/modules/goods';
import * as orderAction from '../../Store/modules/order';

import '../../css/home.css';

// import img from '../../source/img/img.json';
import URL from '../../config/url';
import icon from '../../source/img/icon.json';
import img from '../../source/img/img.json';

import $ from 'jquery';

class ReviewList extends Component {

    async componentDidMount() {
        // 유저의 구매내역 조회하기
        await this._getUserOrderInfo(); 

        const set_scroll = document.getElementById('review_order_list');

        if(set_scroll !== null) {
            set_scroll.addEventListener("scroll", this._setScrollSize);
        }
    }

    _setScrollSize = async () => {
        const { _checkScrolling, review_scroll, review_scrolling, review_length, configAction } = this.props;

        const add_scroll = review_scroll + 1;
        const limit_check = (add_scroll * 5) - review_length;

        if(review_scrolling === false && (limit_check < 0) ) {
            const check = _checkScrolling('#review_order_list');

            const obj = {}

            if(check === true && limit_check) {
                obj['scroll'] = add_scroll;
                obj['scrolling'] = true;

                $('#review_order_list').css({ 'overflow' : 'hidden' });
                configAction.toggle_review_modal(obj);

                const scrolling = await this._getUserOrderInfo(add_scroll);
                if(scrolling === true) {
                    $('#review_order_list').css({ 'overflow' : 'auto' });
                    configAction.toggle_review_modal({ 'scrolling' : false });
                }
            }
        }
    }

    _getUserOrderInfo = async (scroll) => {
        const { user_info, orderAction, review_scroll, configAction, review_order_id } = this.props;
        const review_goods_id = Number(this.props.review_goods_id);
        const cover_scroll = scroll ? scroll : review_scroll;

        const obj = { 'type' : 'SELECT', 'table' : 'order', 'comment' : '유저의 주문 내역 조회', 'join' : true, 'join_table' : 'review' };
        
        // 해당 쿼리의 결과에서 다시 조회
        obj['re_qry'] = true;
        obj['re_qry_where'] = [];
        obj['re_qry_where'][0] = { 'key' : 'review_id', 'value' : 'IS NULL' };

        obj['join_type'] = 'LEFT JOIN'
        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'order_id', 'key2' : 'id' };

        obj['join_where'] = [];
        obj['join_where'].push({ 'columns' : 'id', 'as' : 'review_id' });

        obj['option'] = {};
        obj['option']['user_id'] = '=';
        obj['option']['order_state'] = '=';
        obj['option']['payment_state'] = '=';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'order', 'key' : 'user_id', 'value' : user_info.id });

        // 주문이 확정되고 결제 완료된 내역만 가져옴 //
        obj['where'].push({ 'table' : 'order', 'key' : 'order_state', 'value' : 2 });
        obj['where'].push({ 'table' : 'order', 'key' : 'payment_state', 'value' : 1 });
        ///////////////////////////////////////////////

        if(review_order_id !== null) {
            // 주문 번호가 정해진 경우 해당 주문번호만 가져옴
            obj['option']['id'] = '=';
            obj['where'].push({ 'table' : 'order', 'key' : 'id', 'value' : review_order_id });
            
        } else {
            // obj['option']['order_id'] = 'IS NULL';
            // obj['where'].push({ 'table' : 'review', 'key' : 'order_id', 'value' : null });
        }

        obj['order'] = [];
        obj['order'].push({ 'table' : 'order', 'key' : 'id', 'value' : "DESC" });

        const end = cover_scroll === 0 ? 5 : (cover_scroll * 5) + 5;

        obj['order'].push({ 'table' : 'order', 'key' : 'limit', 'value' : [end] });

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        // 총 갯수 구하기
        const cover_obj = obj;
        cover_obj['count'] = true;
        cover_obj['re_qry_count'] = true;

        const get_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })

        const cover_cart_data = get_data.data[0];

        // 총 갯수 저장하기 (스크롤링에 필요함)
        configAction.toggle_review_modal({ 'length' : get_cnt.data[0][0]['count(*)'] });
    
        let cart_data = [];

        let prev_id = null;
        await cover_cart_data.forEach( async (el) => {
            const num = JSON.parse(el.cart_list);

            if(prev_id === el.id) {
                return;
            }
            prev_id = el.id;

            const info = {};
            info['order_id'] = el.id;
            info['date'] = el.create_date;
            info['final_price'] = el.final_price;

            if(typeof num === 'number') {
                info['goods_id'] = num;
                info['bool'] = false;
                info['num'] = el.goods_num;
                // cart 테이블과 조회가 필요하지 않음

                if(review_goods_id !== null) {
                    if(review_goods_id === num) {
                        cart_data.push(info);
                    }
                }

            } else if(typeof num === 'object') {
                num.forEach( (cu) => {

                    cart_data[cart_data.length] = {};
                    cart_data[cart_data.length - 1]['cart_id'] = cu;
                    cart_data[cart_data.length - 1]['bool'] = true;

                    cart_data[cart_data.length - 1]['order_id'] = el.id;
                    cart_data[cart_data.length - 1]['date'] = el.create_date;
                    cart_data[cart_data.length - 1]['final_price'] = el.final_price;
                })
            }
        })

        const get_cart_info = async (limit, info_arr, cart_data) => {
            const el = cart_data[limit];

            if(el !== undefined) {
                const review_goods_id = Number(this.props.review_goods_id) === 0 ? null : Number(this.props.review_goods_id);

                // 상품 정보 가져오기
                const cart_obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '상품 정보 가져오기' };

                cart_obj['table'] = 'goods';
                cart_obj['comment'] = '상품 정보 가져오기' 
                    
                cart_obj['option'] = {};
                cart_obj['where'] = [];

                if(el.bool === true) {
                    // cart 테이블과 연동
                    cart_obj['join'] = true;
                    cart_obj['join_table'] = 'cart';

                    cart_obj['join_arr'] = [];
                    cart_obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' };

                    cart_obj['join_where'] = [];
                    cart_obj['join_where'].push({ 'columns' : 'num', 'as' : 'goods_num' });
                    cart_obj['join_where'].push({ 'columns' : 'price', 'as' : 'price' });

                    cart_obj['option']['id'] = '=';
                    cart_obj['where'][0] = { 'table' : 'cart', 'key' : 'id', 'value' : el.cart_id };
    
                } else if(el.bool === false) {

                    // cart_obj['join'] = true;
                    // cart_obj['join_table'] = 'review';

                    // // = SELECT em1.*, em2.contents as anwser 
            
                    // cart_obj['join_arr'] = [];
                    // cart_obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

                    cart_obj['option']['id'] = '=';
                    cart_obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : el.goods_id };
                }

                const get_data = await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : cart_obj
                })

                const data = get_data.data[0][0];

                // 중복 체크하기
                const overlap_check = { 'type' : 'SELECT', 'table' : 'review', 'comment' : '중복 체크하기' };
                overlap_check['option'] = {};
                overlap_check['where'] = []

                overlap_check['option']['user_id'] = '=';
                overlap_check['option']['goods_id'] = '=';
                overlap_check['option']['order_id'] = '=';
                // overlap_check['option']['state'] = '=';

                overlap_check['where'][0] = { 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id };
                overlap_check['where'][1] = { 'table' : 'review', 'key' : 'goods_id', 'value' : data.id };
                overlap_check['where'][2] = { 'table' : 'review', 'key' : 'order_id', 'value' : el.order_id };
                // overlap_check['where'][3] = { 'table' : 'review', 'key' : 'state', 'value' : 0 };

                const overlap = await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : overlap_check
                })

                if(data && overlap.data[0].length === 0) {
                    data['order_id'] = el.order_id;
                    data['date'] = el.date;
                    data['final_price'] = el.final_price;
                    data['num'] = el.num ? el.num : data.goods_num;
                    data['bool'] = el.bool;

                    if(review_goods_id !== null) {
                        if(review_goods_id === data.id) {
                            info_arr.push(data);
                        }

                    } else {
                        info_arr.push(data);
                    }
                }

                limit += 1;
                if(limit === cart_data.length) {
                    return info_arr;
                }

                return get_cart_info(limit, info_arr, cart_data)

            } else {
                return false;
            }
        }

        const result_cart_info = await get_cart_info(0, [], cart_data);
        
        const all_length = get_cnt.data[0][0]['count(*)'];
        // 카트 데이터 5개 채우기

        // const scroll_limit = Math.round(all_length / review_scroll);

        // if(!review_goods_id && !review_order_id) {
            if( (cover_scroll * 5) - all_length < 0) {
                if(result_cart_info.length < 5) {
                    await this._getUserOrderInfo(cover_scroll + 1);
                }
            }
        // }

        // if(result_cart_info.length < 5) {
        //     console.log((5 * cover_scroll) + 5, cover_scroll, all_length)

        //     if( (5 * cover_scroll) + 5 < all_length ) {
        //         await this._getUserOrderInfo(cover_scroll + 1);
        //     }
        // }

        configAction.toggle_review_modal({ 'arr' : JSON.stringify(result_cart_info), 'loading' : true, 'scroll' : cover_scroll });
        orderAction.save_order_info({ 'order_info' : JSON.stringify(get_data.data[0]), 'loading' : true })
        
        return true;
    }

    _toggleWriteReview = (bool, key) => {
        const { configAction, review_start, review_select } = this.props;

        const obj = {};
        obj['star'] = 0;

        if(review_select !== null) {
            const title = $('.review_title_input').val().trim();
            const contents = $('.review_contents').val().trim();

            if(Number(review_start) > 0 || title.length > 0 || contents.length > 0) {
                if(!window.confirm('작성중인 내용이 있습니다. \n취소하시겠습니까?')) {
                    return;
                }
            }
        }

        if(bool === true) {
            obj['select'] = key;

            // const height = $('#review_goods_' + key).offset().top;
            // _moveScrollbar('html', 'y', height);
            // console.log(height);

        } else if(bool === false) {
            obj['select'] = null;
        }

        configAction.toggle_review_modal(obj)
    }

    // 리뷰 등록하기
    _submitReview = async (info) => {
        // event.preventDefault();
        const { _checkLogin, configAction, review_star, review_writing, review_callback, review_order_id, start_date } = this.props;
        const user_info = await _checkLogin();

        if(!user_info) {
            alert('로그인 시간이 만료되었습니다. \n다시 로그인을 시도해주세요.');
            return window.location.replace('/');
        }

        if(review_writing === true) {
            alert('잠시만 기다려주세요. 작업을 처리하고 있습니다.')
            return;
        }

        const title = $('.review_title_input').val().trim();
        const contents = $('.review_contents').val().trim();

        if(Number(review_star) === 0) {
            return alert('평점을 설정해주세요.');

        } else if(title.length < 2) {
            alert('리뷰 제목을 최소 2 글자 이상 입력해주세요.');
            return $('input[name=review_title]').focus();

        } else if(contents.length < 10) {
            alert('리뷰 내용을 최소 10 글자 이상 입력해주세요.');
            return $('textarea[name=review_contents]').focus();
        }

        configAction.toggle_review_modal({ 'writing' : true });

        // 리뷰 데이터 추가
        const insert_obj = { 'type' : 'INSERT', 'table' : 'review', 'comment' : '리뷰 정보 추가' };

        insert_obj['columns'] = []
        insert_obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
        insert_obj['columns'].push({ "key" : "goods_id", "value" : info.id });
        insert_obj['columns'].push({ "key" : "order_id", "value" : info.order_id });
        insert_obj['columns'].push({ "key" : "score", "value" : review_star });
        insert_obj['columns'].push({ "key" : "state", "value" : 0 });
        insert_obj['columns'].push({ "key" : "title", "value" : title });
        insert_obj['columns'].push({ "key" : "contents", "value" : contents.replace(/(\n|\r\n)/g, '<br>') });
        insert_obj['columns'].push({ "key" : "create_date", "value" : null });

        const set_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : insert_obj
        })

        if(set_data.data[0]) {
            // 상품 평점 업데이트
            await this._updateGoodsStars(info);

            // 리뷰 내역 최신화하기
            await this._getUserOrderInfo(); 

            const reset_obj = {};
            reset_obj['writing'] = false;
            reset_obj['star'] = 0;
            reset_obj['select'] = null;

            configAction.toggle_review_modal(reset_obj);

            // configAction.toggle_review_modal({ 'bool' : false });

            if(review_callback !== null) {
                if(review_order_id !== null) {
                    await review_callback(start_date, review_order_id)

                } else {
                    await review_callback(info.id);
                }
            }

            $('#review_write_loading').hide();

            alert('리뷰를 등록했습니다.');
            
        } else {
            alert('리뷰를 등록하지 못했습니다. \n관리자에게 직접 문의해주세요.');
        }
    }

    // 상품의 평점 업데이트
    _updateGoodsStars = async (info) => {
        const { review_star, _checkLogin } = this.props;
        const user_info = await _checkLogin();
        
        if(!user_info) {
            alert('로그인 시간이 만료되었습니다. \n다시 로그인을 시도해주세요.');
            return window.location.replace('/');
        }

        const obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '상품 평점 정보 가져오기', 'join' : true, 'join_table' : 'review' };

        obj['columns'] = [];
        obj['columns'].push({ "table" : "goods", "columns" : "star" })
        obj['columns'].push({ "table" : "goods", "columns" : "acc_star" })

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

        obj['join_where'] = [];
        obj['join_where'].push({ 'opt' : 'count' });

        obj['option'] = {};
        obj['where'] = [];

        obj['option']['id'] = '=';
        obj['option']['state'] = '=';

        obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : info.id };
        obj['where'][1] = { 'table' : 'review', 'key' : 'state', 'value' : 0 };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const result_data = get_data.data[0][0];

        let star = result_data.star === null ? 0 : Number(result_data.star);
        let count = Number(result_data.count);

        const acc_star = Number(result_data.acc_star) + review_star;

        if(count === 0) {
            star = String(review_star);

        } else {
            star = String((acc_star) / count);
        }

        if(star.length > 3) {
            star = star.slice(0, 3);
        }

        // 상품 평점 업데이트하기
        const update_obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '상품 평점 업데이트' };
        
        update_obj['columns'] = [];
        update_obj['columns'].push({ 'key' : 'star', 'value' : star });
        update_obj['columns'].push({ 'key' : 'acc_star', 'value' : acc_star });
    
        update_obj['where'] = [];
        update_obj['where'].push({ 'key' : 'id', 'value' : info.id });

        update_obj['where_limit'] = 0;

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_obj
        })
    }

    render() {
        const { order_loading, configAction, review_loading, price_comma, review_select, review_star, review_writing, review_scrolling } = this.props;
        const { _toggleWriteReview, _submitReview } = this;
        // const order_info = JSON.parse(this.props.order_info);
        const review_info = JSON.parse(this.props.review_info);

        const star_arr = [1, 2, 3, 4, 5];

        return(
            order_loading === true ?

            <div id='review_list_div'>

                {review_writing === true 
                    ? <div id='review_write_loading'>
                        <div>
                            <h3> 리뷰를 등록하고 있습니다. </h3>
                            <p> 잠시만 기다려주세요. </p>
                        </div>
                      </div>

                    : null
                }

                <div id='review_list_title_div'>
                    <h4 className='aCenter recipe_korea'> 리뷰 리스트 </h4>
                    <img src={icon.icon.close_black} id='review_list_close_icon' className='pointer'
                        onClick={() => review_writing === false ? configAction.toggle_review_modal({ 'bool' : false, 'loading' : false, 'goods_id' : null, 'select' : null, 'star' : 0, 'scroll' : 0 }) : null} alt=''
                    />
                </div>

                {review_loading === true ? 
                    review_info.length > 0 ?
                        <div id='review_list_contents_div' className='font_14'>
                            <h4> 리뷰 가능 주문 내역 </h4>

                            <div id='review_order_list'>
                                {review_info.map( (el, key) => {
                                    let final_price = el.result_price * el.num;

                                    const hidden_data = {};
                                    hidden_data['order_id'] = el.order_id;
                                    hidden_data['goods_id'] = el.id;

                                    return(
                                        // <InfiniteScroll
                                        //     dataLength={5}
                                        //     next={_infiniteScroll}
                                        //     hasMore={true}
                                        //     loader={<h4>Loading...</h4>}
                                        //     key={key}
                                        // >
                                        <div key={key} className='review_goods_data_div'
                                             id={'review_goods_' + key}
                                             style={review_info.length !== key + 1 ? { 'borderBottom' : 'dotted 2px black' } : null}
                                        >
                                            <div className='review_order_info_div font_12'>
                                                <div style={{ 'float' : 'left' }}> 주문 번호　|　{el.order_id} </div>
                                                <div style={{ 'float' : 'right' }}> 주문 일자　|　{el.date} </div>
                                            </div>

                                            <div className='review_goods_info_div'>
                                                <div style={{ 'backgroundImage' : `url(${el.thumbnail})` }}  className='review_goods_thumbnail_div' />
                                                <div className='review_goods_name_and_price_div'> 
                                                    <h4 className='review_goods_name_div cut_one_line'> {el.name} </h4>
                                                    <p className='review_goods_num_and_price_div'> {price_comma(el.num)} 개　|　{price_comma(final_price)} 원 </p>
                                                </div>
                                            </div>

                                            <input type='button' className='review_write_open_button pointer' 
                                                    value={review_select !== key ? '▽ 리뷰 작성하기' : '△ 리뷰 작성 닫기' }
                                                   onClick={() => review_select !== key 
                                                                    ? _toggleWriteReview(true, key)
                                                                    : _toggleWriteReview(false)
                                                }
                                            />
                                            
                                            {review_select === key ? 
                                                <div className='review_write_div' id={'review_write_div_' + key}>
                                                    {/* <form name='review'> */}
                                                        <div className='review_select_score_div'> 
                                                            <div> 평점　|　</div>
                                                            {star_arr.map( (el) => {
                                                                return(
                                                                    <div className='review_stars' key={el}
                                                                         onClick={() => configAction.toggle_review_modal({ 'star' : el })}
                                                                         style={ Number(review_star) >= Number(el) 
                                                                                ? { 'color' : '#fdb827' }
                                                                                : null
                                                                        }
                                                                    > 
                                                                    {Number(review_star) >= Number(el) ? '★' : '☆'} 
                                                                    </div>
                                                                )
                                                            })}
                                                            <div>　( {review_star} ) </div>
                                                        </div>

                                                        <div> <input placeholder='제목을 입력해주세요.' className='review_title_input' maxLength='30' name='review_title'/> </div>
                                                        <div> 
                                                            <textarea className='review_contents' maxLength='200' name='review_contents'/> 
                                                        </div>

                                                        <input type='submit' value='리뷰 등록' className='reivew_submit_button pointer' 
                                                               onClick={() => _submitReview(el)}
                                                        />
                                                    {/* </form> */}
                                                </div>
                                            : null}
                                        </div>
                                        // </InfiniteScroll>
                                    )
                                })}

                                {review_scrolling
                                    ? <h3 id='review_scrolling_alert'> 추가 정보들을 불러오고 있습니다. </h3>

                                    : null
                                }
                            </div>
                        </div>

                    : <div id='review_list_empty_div' className='aCenter recipe_korea'>
                        <h3> 리뷰를 남길 수 있는 주문 내역이 없습니다. </h3>
                    </div>    

                : <div id='review_list_loading_div' className='aCenter'>
                    <h3> 데이터를 불러오고 있습니다. </h3>
                  </div>
                }
            </div>

            : <div id='review_list_loading_div' className='aCenter'>
                <div> <img src={img.img.loading} alt='' /> </div>
                <h3> 데이터를 불러오고 있습니다. </h3>
              </div>
        )
    }
}

ReviewList.defaultProps = {
}

export default connect(
  (state) => ({
    order_info : state.order.order_info,
    order_loading : state.order.order_loading,
    review_scroll : state.config.review_scroll,
    review_info : state.config.review_info,
    review_loading : state.config.review_loading,
    review_select : state.config.review_select,
    review_star : state.config.review_star,
    review_goods_id : state.config.review_goods_id,
    review_writing : state.config.review_writing,
    review_callback : state.config.review_callback,
    review_order_id : state.config.review_order_id,
    start_date : state.order.start_date,
    review_length : state.config.review_length,
    review_scrolling : state.config.review_scrolling
  }), 

  (dispatch) => ({
    configAction : bindActionCreators(configAction, dispatch),
    goodsAction : bindActionCreators(goodsAction, dispatch),
    orderAction : bindActionCreators(orderAction, dispatch),
  })
)(ReviewList);