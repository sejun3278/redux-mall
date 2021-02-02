import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import img from '../../../source/img/icon.json';
import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

let scrolling = false;
class Review extends Component {

    async componentDidMount() {
      // 리뷰 데이터 저장하기
      await this._getReviewInfo(0);

      // 스크롤링
      window.addEventListener("scroll", this._setScrollSize);
    }

    _setScrollSize = async () => {
      const { mypage_review_length, mypage_review_scroll, myPageAction } = this.props;

      const event = 'html'
      // const check = _checkScrolling('#body_div');

      const scroll_top = $(event).scrollTop();
      // 현재 스크롤바의 위치
  
      const inner_height = $('#bottom_div').prop('scrollHeight');
      // 해당 div 의 총 높이
  
      const scroll_height = $('#mypage_reivew_info_list_div').prop('scrollHeight');
      
      if(scrolling === false) {
        if( (Math.round(scroll_top) + inner_height) >= (scroll_height - 100)) {
          const add_scroll = mypage_review_scroll + 1;
          const limit_check = (add_scroll * 10) - mypage_review_length;

          if(limit_check < 0) {
            scrolling = true;

            myPageAction.save_mypage_reivew_data({ 'scroll' : add_scroll })
            this._getReviewInfo(add_scroll);
          }
        }
      }
    }

    // 리뷰 데이터 저장
    _getReviewInfo = async (scroll) => {
      const { myPageAction, mypage_review_scroll, mypage_review_all_select } = this.props;
      const user_info = JSON.parse(this.props.user_info);

      const obj = { 'type' : 'SELECT', 'table' : 'review', 'comment' : '리뷰 데이터 가져오기', 'join' : true, 'join_table' : 'goods' };

      obj['join_arr'] = [];
      obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'goods_id' }

      obj['add_table'] = [];
      obj['add_table'][0] = { 'table' : 'order', 'type' : 'INNER JOIN', 'key1' : { 'table' : 'order', 'value' : 'id' }, 'key2' : { 'table' : 'review', 'value' : 'order_id' }}

      obj['join_where'] = [];
      obj['join_where'].push({ 'columns' : 'thumbnail', 'as' : 'goods_thumbnail' });
      obj['join_where'].push({ 'columns' : 'name', 'as' : 'goods_name' });
      // obj['join_where'].push({ 'columns' : 'result_price', 'as' : 'goods_price' });
      obj['join_where'].push({ 'columns' : 'star', 'as' : 'goods_star' });
      obj['join_where'].push({ 'columns' : 'cart_list', 'as' : 'order_cart_list', 'table' : 'order' });
      obj['join_where'].push({ 'columns' : 'goods_num', 'as' : 'order_goods_num', 'table' : 'order' });
      obj['join_where'].push({ 'columns' : 'result_price', 'as' : 'order_result_price', 'table' : 'order' });

      obj['option'] = {};
      obj['option']['user_id'] = '=';
      obj['option']['state'] = '<>';

      obj['where'] = [];
      obj['where'].push({ 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id });
      obj['where'].push({ 'table' : 'review', 'key' : 'state', 'value' : 1 });

      obj['order'] = [];
      obj['order'].push({ 'table' : 'review', 'key' : 'id', 'value' : "DESC" });

      const cover_scroll = mypage_review_scroll ? mypage_review_scroll : scroll;
      const end = cover_scroll === 0 ? 10 : (cover_scroll * 10) + 10;

      obj['order'].push({ 'table' : 'review', 'key' : 'limit', 'value' : [end] });

      const get_data = await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : obj
      })
      const review_info = get_data.data[0];

      review_info.forEach( (el) => {
        const cart_list = JSON.parse(el.order_cart_list);
        
        if(typeof cart_list === 'object') {
          cart_list.forEach( async (cu) => {
            const get_cart_obj = { 'type' : 'SELECT', 'table' : 'cart', 'comment' : 'cart 테이블에서 상품 갯수 가져오기' };

            get_cart_obj['option'] = {};
            get_cart_obj['option']['user_id'] = '=';
            get_cart_obj['option']['id'] = '=';
            get_cart_obj['option']['goods_id'] = '=';
      
            get_cart_obj['where'] = [];
            get_cart_obj['where'].push({ 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id });
            get_cart_obj['where'].push({ 'table' : 'cart', 'key' : 'id', 'value' : cu });
            get_cart_obj['where'].push({ 'table' : 'cart', 'key' : 'goods_id', 'value' : el.goods_id });

            const get_cart_info = await axios(URL + '/api/query', {
              method : 'POST',
              headers: new Headers(),
              data : get_cart_obj
            })

            if(get_cart_info.data[0][0]) {
              const result = get_cart_info.data[0][0];

              el.order_goods_num = result.num;
              el.order_result_price = result.num * result.price;
            }
          })
        }

      })

      // 총 갯수 구하기
      const cover_obj = obj;
      cover_obj['count'] = true;

      const get_cnt = await axios(URL + '/api/query', {
          method : 'POST',
          headers: new Headers(),
          data : cover_obj
      })

      const save_obj = {};
      save_obj['arr'] = JSON.stringify(review_info);
      save_obj['length'] = get_cnt.data[0][0]['count(*)'];
      save_obj['loading'] = true;

      if(scroll > 0) {
        scrolling = false;
      }

      await myPageAction.save_mypage_reivew_data(save_obj);

      if(mypage_review_all_select) {
        this._selectReviewList(null, true)
      }

      return;
    }

    _selectReviewList = (num, all_check) => {
      const { myPageAction } = this.props;
      const mypage_review_select = JSON.parse(this.props.mypage_review_select);
      let cover_obj = mypage_review_select;

      const review_info = JSON.parse(this.props.mypage_review_info);

      const save_obj = {}
      if(!all_check) {
        const check = mypage_review_select[num];

        // 개별 선택
        if(check) {
          delete cover_obj[num];

          save_obj['all_select'] = false;

        } else {
          cover_obj[num] = { 'id' : num };
        }

      } else {
        cover_obj = {}
        save_obj['all_select'] = false;

        // 전체 선택을 클릭할 경우
        if(Object.keys(mypage_review_select).length !== review_info.length) {
          
          save_obj['all_select'] = true;
          review_info.map( (el) => {
            cover_obj[el.id] = { 'id' : el.id };
          })
        }
      }

      save_obj['select'] = JSON.stringify(cover_obj);
      myPageAction.save_mypage_reivew_data(save_obj)
    }


    render() {
      const { mypage_review_length, mypage_review_loading } = this.props;
      const { _selectReviewList } = this;

      const review_info = JSON.parse(this.props.mypage_review_info);
      const mypage_review_select = JSON.parse(this.props.mypage_review_select);

      let div_style = { 'borderTop' : 'solid 2px #ababab', 'borderBottom' : 'solid 2px #ababab' };
      if(mypage_review_length === 0 || review_info.length === 0) {
        div_style = { 'borderTop' : 'dotted 2px #ababab', 'borderBottom' : 'dotted 2px #ababab' };
      }

      const star_arr = [1, 2, 3, 4, 5];

      const select_length = Object.keys(mypage_review_select).length;

        return(
            <div id='mypage_review_div'>
              {mypage_review_loading === true
                ? <div id='mypage_review_info_div'>

                    <p id='mypage_review_length_title' className='font_13 bold'> 총 {mypage_review_length} 개의 리뷰 정보가 조회되었습니다. </p>

                    <div id='mypage_all_select_div' className='font_12'>
                      <div className='aCenter'>
                        <div className='float_left gray'>
                          <input type='checkbox' id='mypage_all_select' className='pointer check_custom_1' 
                                  onChange={() => _selectReviewList(null, true)}
                                  checked={select_length === review_info.length}
                          />
                            <span className='check_toggle_1' 
                                  onClick={() => _selectReviewList(null, true)} 
                            />
                            <label className='pointer paybook_bold' htmlFor='mypage_all_select' id='mypage_qna_all_check_label'> 
                              전체 선택 
                              ( {select_length} / {review_info.length} ) 
                            </label>
                        </div>
                      </div>

                      <div id='mypage_review_all_remove_div'>
                        <div className='float_right'> <input type='button' value='선택 삭제' className='pointer' id='mypage_review_select_remove_button' /> </div>
                      </div>
                    </div>

                    <div id='mypage_reivew_info_list_div' style={div_style}>
                      {mypage_review_length !== 0 || review_info.length !== 0
                        ? review_info.map( (el, key) => {
                            
                            let star = '';
                            let goods_star = '';

                            star_arr.forEach( (cu) => {

                              if(Number(el.score) >= cu || Number(el.goods_star) >= cu) {
                                star += '<b class="star_color" > ★ </b>'
                                // star += '<b style={{ color : rgb(253, 184, 39) }}> ★ </b>'

                                if(Number(el.goods_star) >= cu) {
                                  goods_star += '<b class="star_color" > ★ </b>';

                                } else {
                                  goods_star += '<b> ☆ </b>';
                                }

                              } else {
                                star += '<b> ☆ </b>'
                                goods_star += '<b> ☆ </b>';
                              }
                            })

                            const star_div = '평점　|　' + star;

                            const goods_num = el.order_goods_num ? el.order_goods_num : 0;
                            const goods_price = el.order_result_price;

                            let class_col = 'mypage_review_list_div'
                            if(mypage_review_select[el.id]) {
                              class_col += ' mypage_select_qna_list';
                            }


                            return(
                              <div className={class_col} key={key}
                                style={review_info.length > (key + 1) ? { 'borderBottom' : 'solid 1px #ababab' } : null}
                              >
                                <div className='mypage_review_other_list_div font_12'>
                                  <div className='mypage_review_other_grid_div pointer'
                                       onClick={ () => _selectReviewList(el.id) }
                                  >
                                    <div> 
                                      <input type='checkbox' className='mypage_review_checkbox pointer'
                                             name={'mypage_review_select_' + el.id}
                                             onChange={() => _selectReviewList(el.id)}
                                             checked={!!mypage_review_select[el.id]}
                                      /> 
                                    
                                    </div>
                                    {/* <div> 상품 번호　|　{el.goods_id} </div> */}
                                    <div> 주문 번호　|　{el.order_id} </div>
                                    {/* <div dangerouslySetInnerHTML={{ __html : star_div }} /> */}
                                  </div>

                                  <div className='mypage_review_star_and_date_grid_div aRight'>
                                    <div className='aCenter'> {el.create_date.slice(0, 16)} </div>
                                    <div className='mypage_review_remove_div'> <input type='button' value='삭제' className='mypage_review_remove_button pointer' /> </div>
                                  </div>
                                </div>

                                <div className='mypage_review_goods_info_and_contents_div'>
                                  <div className='mypage_review_goods_info_div'>
                                    <div className='mypage_review_goods_thumb_and_star'>
                                      <div style={{ 'backgroundImage' : `url(${el.goods_thumbnail})` }} className='mypage_review_goods_thumbnial pointer' 
                                           onClick={() => window.location.href='/goods?goods_num=' + el.goods_id} title={el.goods_name}
                                      />
                                      <div className='aCenter' style={{ 'marginTop' : '5px' }} dangerouslySetInnerHTML={{ __html : goods_star }} />
                                    </div>

                                    <div className='mypage_review_goods_name_and_price_div'>
                                      <div className='font_12'> 상품 번호　|　{el.goods_id} </div>
                                      <div className='bold cut_multi_line mypage_review_goods_name_div recipe_korea' title={el.goods_name} > 
                                        <b className='pointer' onClick={() => window.location.href='/goods?goods_num=' + el.goods_id}> {el.goods_name} </b> 
                                      </div>
                                      <div className='mypage_review_goods_num_and_price_div gray'> {goods_num} 개　|　{goods_price} 원</div>
                                    </div>
                                  </div>

                                  <div className='mypage_review_contents_div font_12'>
                                      <div className='mypage_review_star_div' dangerouslySetInnerHTML={{ __html : star_div }} />
                                      <div className='mypage_review_title_div'> 제목　|　{el.title} </div>
                                      <div className='mypage_review_contents_div'> {el.contents} </div>
                                    </div>
                                </div>
                              </div>
                            )
                        })
                        
                        : <div id='mypage_review_empty_div' className='aCenter'>
                            <h3> 리뷰 내역이 없습니다. </h3>
                              <p className='font_13 gray'> 
                                <u className='pointer' onClick={() => window.location.href='/search'}> 
                                  ◀　상품 리뷰하러 가기
                                </u> 
                              </p>
                          </div>
                      }
                    </div>

                    {scrolling === true
                      ? <h3 id='mypage_loading_scrolling'> 
                          데이터를 불러오고 있습니다.
                        </h3>

                      : null
                    }
                  </div>

                : <div id='mypage_review_loading_div' className='marginTop_40 gray paybook_bold'>
                    <h3 className='aCenter'> 데이터를 불러오고 있습니다. </h3>
                  </div>
              }
            </div>
        )
    }
}
  
  export default connect(
    (state) => ({
        user_info : state.config.user_info,
        mypage_review_info : state.my_page.mypage_review_info,
        mypage_review_length : state.my_page.mypage_review_length,
        mypage_review_scroll : state.my_page.mypage_review_scroll,
        // mypage_review_scrolling : state.my_page.mypage_review_scrolling,
        mypage_review_loading : state.my_page.mypage_review_loading,
        mypage_review_select : state.my_page.mypage_review_select,
        mypage_review_all_select : state.my_page.mypage_review_all_select
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Review);