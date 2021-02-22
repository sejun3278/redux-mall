import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

// import img from '../../../source/img/icon.json';
import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

let scrolling = false;
let remove = false;
class Review extends Component {

    async componentDidMount() {
      // const { location } = this.props;
      // const qry = queryString.parse(location.search);

      // if(qry['date'] && qry['star']) {
      //   alert('잘못된 경로입니다.');
      //   return window.location.replace('/myPage/star')
      // }

      // 리뷰 데이터 저장하기
      await this._getReviewInfo(0);

      // 스크롤링
      window.addEventListener("scroll", this._setScrollSize);
    }

    _setScrollSize = async () => {
      const { mypage_review_length, mypage_review_scroll, myPageAction, mypage_review_removing } = this.props;

      const event = 'html'
      // const check = _checkScrolling('#body_div');

      const scroll_top = $(event).scrollTop();
      // 현재 스크롤바의 위치
  
      const inner_height = $('#bottom_div').prop('scrollHeight');
      // 해당 div 의 총 높이
  
      const scroll_height = $('#mypage_reivew_info_list_div').prop('scrollHeight');
      
      if(scrolling === false && mypage_review_removing === false) {
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
      const { myPageAction, mypage_review_scroll, mypage_review_all_select, location } = this.props;
      const user_info = JSON.parse(this.props.user_info);
      const qry = queryString.parse(location.search);

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

      obj['where'] = [];
      obj['where'].push({ 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id });

      if(!qry['remove']) {
        obj['option']['state'] = '<>';
        obj['where'].push({ 'table' : 'review', 'key' : 'state', 'value' : 1 });
      }

      if(qry['goods_id']) {
        obj['option']['goods_id'] = '=';
        obj['where'].push({ 'table' : 'review', 'key' : 'goods_id', 'value' : qry.goods_id });
      }

      if(qry['contents']) {
        obj['option']['contents'] = 'LIKE';
        obj['where'].push({ 'table' : 'review', 'key' : 'contents', 'value' : '%' + qry.contents + '%' });
      }

      obj['order'] = [];
      obj['order'][0] = { 'table' : 'review', 'key' : 'id', 'value' : "DESC" };
      
      if(qry['date']) {
        if(qry['date'] === 'past') {
          obj['order'][0] = { 'table' : 'review', 'key' : 'id', 'value' : "ASC" };
        }
      }

      if(qry['star']) {
        if(qry['star'] === 'high') {
          obj['order'][0] = { 'table' : 'review', 'key' : 'score', 'value' : "DESC" };
        
        } else if(qry['star'] === 'low') {
          obj['order'][0] = { 'table' : 'review', 'key' : 'score', 'value' : "ASC" };

        } else {
          obj['option']['score'] = '=';
          obj['where'].push({ 'table' : 'review', 'key' : 'score', 'value' : qry.star });
        }
      }

      const cover_scroll = scroll ? scroll : mypage_review_scroll;
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

    _selectReviewList = (info, all_check) => {
      const { myPageAction } = this.props;
      const mypage_review_select = JSON.parse(this.props.mypage_review_select);
      let cover_obj = mypage_review_select;

      const review_info = JSON.parse(this.props.mypage_review_info);

      const save_obj = {}
      if(!all_check) {
        const check = mypage_review_select[info.id];

        // 개별 선택
        if(check) {
          delete cover_obj[info.id];

          save_obj['all_select'] = false;

        } else {
          cover_obj[info.id] = { 'id' : info };
        }

      } else {
        cover_obj = {}
        save_obj['all_select'] = false;

        // 전체 선택을 클릭할 경우
        if(Object.keys(mypage_review_select).length !== review_info.length) {
          
          save_obj['all_select'] = true;
          review_info.map( (el) => {
            cover_obj[el.id] = { 'id' : el };
          })
        }
      }

      save_obj['select'] = JSON.stringify(cover_obj);
      myPageAction.save_mypage_reivew_data(save_obj)
    }

    _reviewFilter = (type, value, reset) => {
      const { location, _filterURL } = this.props;
      const qry = queryString.parse(location.search);

      if(reset) {
        return window.location.href='/myPage/star';

      } else {
        if(type === 'date' || type === 'star') {
          const other = type === 'date' ? 'star' : 'date';

          if(qry[other]) {
            if(type === 'star') {
              if(value === 'high' || value === 'low') {
                delete qry[other];
              }

            } else if(type === 'date') {
              if(qry[other] === 'high' || qry[other] === 'low') {
                delete qry[other];
              }
            }
          }
        }

        if(type === 'star' && value === 'custom') {
          const star = $('#mypage_review_custom_star_select').val();

          if(star === 'null') {
            delete qry['star'];

          } else {
            qry['star'] = star;
          }

        } else {
          if(qry[type]) {
            if(qry[type] !== value) {
              qry[type] = value;

            } else {
              delete qry[type];
            }

          } else {
            qry[type] = value;
          }
        }
      }

      if(Object.keys(qry).length === 0) {
        return window.location.href='/myPage/star';
      }

      return _filterURL(qry, "");
    }

    _mypageReviewSearch = (event) => {
      event.preventDefault();
      const form_data = event.target;

      const { _filterURL, location } = this.props;
      const qry = queryString.parse(location.search);
      
      const goods_id = form_data.goods_id.value;
      const contents = form_data.contents.value.trim();

      if(goods_id > 0) {
        qry['goods_id'] = goods_id;

      } else {
        delete qry['goods_id'];
      }

      if(contents.length > 0) {
        qry['contents'] = contents;

      } else {
        delete qry['contents'];
      }

      if(Object.keys(qry).length === 0) {
        return window.location.href='/myPage/star';
      }

      return _filterURL(qry, "");
    }

    _removeReviewFn = async ( all, info ) => {
      let cover_mypage_review_select = JSON.parse(this.props.mypage_review_select);
      let select_length = Object.keys(cover_mypage_review_select).length
      const { myPageAction, mypage_review_removing, _checkLogin, _removeReview } = this.props;

      const user_info = await _checkLogin();

      if(!user_info) {
        alert('로그인 시간이 만료되었습니다. \n다시 로그인을 시도해주세요.');
        return window.location.replace('/');

      } else if(mypage_review_removing === true || remove === true) {
        alert('삭제를 진행하고 있습니다. \n잠시만 기다려주세요.');
        return;
      }

      let confirm_ment = '\n( 삭제된 리뷰는 재등록 할 수 없으니 신중하게 선택해주세요. )';
      if(all) {
        if(select_length === 0) {
          alert('삭제할 리뷰를 하나 이상 선택해주세요.');
          return;
        }

        // 선택 삭제일 경우
        confirm_ment = '선택된 ' + select_length + ' 개의 리뷰를 모두 삭제하시겠습니까?' + confirm_ment;

      } else {
        confirm_ment = '선택한 리뷰를 삭제하시겠습니까?' + confirm_ment;

        cover_mypage_review_select = {};
        cover_mypage_review_select[info.id] = { 'id' : info }
      }
      
      if(window.confirm(confirm_ment)) {
        remove = true;

        select_length = Object.keys(cover_mypage_review_select).length;
        myPageAction.save_mypage_reivew_data({ 'remove' : true });

        const mypage_review_select = JSON.parse(this.props.mypage_review_select);
        const remove_review = async (limit) => {
          const get_review_info = Object.values(cover_mypage_review_select)[limit];
          const review_info = get_review_info.id;

          delete mypage_review_select[review_info.id];

          if(review_info.state === 0) {
            await _removeReview(review_info.id, review_info.goods_id, review_info.score, user_info.id, false);
          }
          limit += 1;

          if(limit >= select_length) {

            alert('삭제가 완료되었습니다.');
            myPageAction.save_mypage_reivew_data({ 'remove' : false, 'select' : JSON.stringify(mypage_review_select), 'all_select' : false });

            // 리스트 최신화
            await this._getReviewInfo();
            remove = false;

            return;

          } else {
            return remove_review(limit)
          }
        }

        await remove_review(0);
      }

      return;
    }

    render() {
      const { location, mypage_review_length, mypage_review_loading, configAction, price_comma, _searchStringColor, mypage_review_removing } = this.props;
      const { _selectReviewList, _reviewFilter, _mypageReviewSearch, _removeReviewFn } = this;

      const qry = queryString.parse(location.search);
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
                ? <div>

                    <div id='mypage_review_all_filter_div'>
                      <div id='mypage_review_filter_div' className='aCenter font_12'>
                        <div id='mypage_review_date_filter_div' className='mypage_review_filter_float_div'>  
                          <div className={qry['date'] === 'lately' ? 'custom_color_1 bold' : null } > 
                            <u onClick={() => _reviewFilter('date', 'lately')}> 최신순으로 정렬 </u> 
                          </div>

                          <div className={qry['date'] === 'past' ? 'custom_color_1 bold' : null } > 
                            <u onClick={() => _reviewFilter('date', 'past')}> 과거순으로 정렬 </u> 
                          </div>
                        </div>

                        <div id='mypage_review_star_filter_div' className='mypage_review_filter_float_div'>  
                          <div className={qry['star'] === 'high' ? 'custom_color_1 bold' : null }>
                            <u onClick={() => _reviewFilter('star', 'high')}> 높은 별점 순 </u> 
                          </div>

                          <div className={qry['star'] === 'low' ? 'custom_color_1 bold' : null }> 
                            <u onClick={() => _reviewFilter('star', 'low')}> 낮은 별점 순 </u>
                          </div>
                        </div>

                        <div id='mypage_review_remove_filter_div' className='mypage_review_filter_float_div'>
                          <div className={qry['remove'] ? 'custom_color_1 bold' : null }> 
                            <u onClick={() => _reviewFilter('remove', 'true')}> 삭제된 리뷰 포함  </u>
                          </div>

                          <div id='mypage_review_custom_star_div'> 
                            <select id='mypage_review_custom_star_select' className='pointer'
                                    onChange={() => _reviewFilter('star', 'custom')}
                                    defaultValue={qry.star}
                            >
                              <option value={'null'}> - 별점 순 - </option>
                              <option value={1}> 1 점 </option>
                              <option value={2}> 2 점 </option>
                              <option value={3}> 3 점 </option>
                              <option value={4}> 4 점 </option>
                              <option value={5}> 5 점 </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={_mypageReviewSearch}>
                        <div id='mypage_review_search_filter_div' className='font_12'>
                          <div> 
                            상품 번호　|　<input type='number' min={1} max={10000} name='goods_id' defaultValue={qry.goods_id} />
                            <input type='image' alt='' src={icon.icon.search_black} className='mypage_review_search_button' /> 
                          </div>

                          <div> 
                            리뷰 내용　|　<input type='text' maxLength={20} name='contents' defaultValue={qry.contents} />
                            <input type='image' alt='' src={icon.icon.search_black} className='mypage_review_search_button' /> 
                          </div>
                        </div>
                      </form>

                    {Object.keys(qry).length > 0 ? 
                      <div id='mypage_review_filter_option_div'>
                        <h4 className='font_13'> 
                          적용중인 필터 옵션 
                          <img alt='' src={icon.icon.reload} id='mypage_qna_filter_reset_button' className='pointer' title='필터 옵션 초기화' 
                               onClick={() => window.confirm('모든 필터 옵션을 삭제하시겠습니까?') ? window.location.href='/myPage/star' : null}
                          /> 
                        </h4>

                        <ul id='mypage_review_filter_option_list_div' className='gray'>
                          {qry.date 
                            ? qry.date === 'lately'
                              ? <li> 최신순으로 정렬 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('date', 'lately')} /> </li> 
                              
                            : qry.date === 'past' 
                              ? <li> 과거순으로 정렬 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('date', 'past')} /> </li> 
                              : null
                            
                            : null}

                            {qry.star
                              ? qry.star === 'high'
                                ? <li> 높은 별점 순 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('star', 'high')} /> </li> 

                              : qry.star === 'low'
                                ? <li> 낮은 별점 순 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('star', 'low')} /> </li> 

                              : qry.star
                                ? <li> 별점 설정　|　{qry.star} 점 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('star', qry.star)} /> </li> 

                              : null
                              
                              : null}

                              {qry.remove 
                                ? <li> 삭제된 리뷰 포함 <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('remove', 'true')} /> </li> 
                                : null
                              }

                              {qry.goods_id 
                                ? <li> 상품 번호　|　{qry.goods_id} <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('goods_id', qry.goods_id)} /> </li> 
                                : null
                              }

                              {qry.contents 
                                ? <li> 리뷰 내용　|　{qry.contents} <img className='mypage_qna_remove_filter_icon' alt='' src={icon.icon.close_black} onClick={() => _reviewFilter('contents', qry.contents)} /> </li> 
                                : null
                              }
                        </ul>
                      </div>

                    : null }
                    </div>

                    <div id='mypage_review_info_div'>

                    <div className='aRight'>
                      <input type='button' value='리뷰 작성' className='pointer goods_write_button button_style_1' 
                            onClick={() => configAction.toggle_review_modal({ 'bool' : true })}
                      />
                    </div>

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
                        <div className='float_right'> 
                          <input type='button' value='선택 삭제' className='pointer' id='mypage_review_select_remove_button' 
                                 onClick={() => mypage_review_removing === false ? _removeReviewFn(true) : null}
                                 style={mypage_review_removing === true ? { 'color' : '#ababab' } : null}
                          /> 
                        </div>
                      </div>
                    </div>

                    <div id='mypage_reivew_info_list_div' style={div_style}>
                      {mypage_review_length !== 0 || review_info.length !== 0
                        ? review_info.map( (el, key) => {
                            
                            let star = '';
                            let goods_star = '';

                            star_arr.forEach( (cu) => {

                              if(Number(el.score) >= cu) {
                                star += '<b class="star_color" > ★ </b>'
                                // star += '<b style={{ color : rgb(253, 184, 39) }}> ★ </b>'

                              } else {
                                star += '<b> ☆ </b>'
                              }

                              // 상품 별점 표시하기
                              if(Number(el.goods_star) >= cu) {
                                goods_star += '<b class="star_color" > ★ </b>';

                              } else {
                                goods_star += '<b> ☆ </b>';
                              }
                            })

                            const star_div = '평점　|　' + star;

                            const goods_num = el.order_goods_num ? el.order_goods_num : 0;
                            const goods_price = el.order_result_price;

                            let class_col = 'mypage_review_list_div'
                            if(mypage_review_select[el.id] && el.state === 0) {
                              class_col += ' mypage_select_qna_list';
                            }

                            let contents = el.contents;
                            if(qry.contents) {
                              contents = _searchStringColor(contents, qry.contents)
                            }

                            return(
                              <div className={class_col} key={key}
                                style={review_info.length > (key + 1) ? { 'borderBottom' : 'solid 1px #ababab' } : null}
                              >
                                <div className='mypage_review_other_list_div font_12'>
                                  <div className='mypage_review_other_grid_div'
                                       onClick={ () => el.state === 0 ? _selectReviewList(el)  : null}
                                       style={el.state === 0 ? { 'cursor' : 'pointer' } : null }
                                  >
                                    <div> 
                                      {el.state === 0
                                        ? <input type='checkbox' className='mypage_review_checkbox pointer'
                                                name={'mypage_review_select_' + el.id}
                                                onChange={() => _selectReviewList(el)}
                                                checked={!!mypage_review_select[el.id]}
                                          /> 

                                        : null
                                      }
                                    </div>
                                    {/* <div> 상품 번호　|　{el.goods_id} </div> */}
                                    <div> 주문 번호　|　{el.order_id} </div>
                                    {/* <div dangerouslySetInnerHTML={{ __html : star_div }} /> */}
                                  </div>

                                  <div className='mypage_review_star_and_date_grid_div aRight'>
                                    <div className='aCenter'> {el.create_date.slice(0, 16)} </div>
                                    <div className='mypage_review_remove_div'>
                                      {el.state === 0
                                        ?
                                        <input type='button' value='삭제' className='mypage_review_remove_button pointer' 
                                              onClick={() => mypage_review_removing === false ? _removeReviewFn(false, el) : null}
                                              style={mypage_review_removing === true ? { 'color' : '#ababab' } : null}
                                        />

                                        : <b className='red font_12'> 삭제됨 </b>
                                      } 
                                    </div>
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
                                      <div className='mypage_review_goods_num_and_price_div gray'> {price_comma(goods_num)} 개　|　{price_comma(goods_price)} 원</div>
                                    </div>
                                  </div>

                                  <div className='mypage_review_contents_div font_12'>
                                      <div className='mypage_review_star_div' dangerouslySetInnerHTML={{ __html : star_div }} />
                                      <div className='mypage_review_title_div'> 제목　|　{el.title} </div>
                                      <div className='mypage_review_contents_div' dangerouslySetInnerHTML={{ __html : contents }} />
                                    </div>
                                </div>
                              </div>
                            )
                        })
                        
                        : <div id='mypage_review_empty_div' className='aCenter'>
                            <h3> 리뷰 내역이 없습니다. </h3>
                              <p className='font_13 gray paybook_bold'> 
                                <u className='pointer' onClick={() => window.location.href='/search'}> 
                                  ◀ 상품 구매하기
                                </u> 
                              </p>
                          </div>
                      }
                    </div>
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
        mypage_review_all_select : state.my_page.mypage_review_all_select,
        mypage_review_removing : state.my_page.mypage_review_removing
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(Review);